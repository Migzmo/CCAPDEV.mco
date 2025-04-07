document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing reply review functionality');
    
    // Function to create a rich text editor for a textarea
    function createRichTextEditor(textarea) {
        if (!textarea) return null;
        
        const container = textarea.parentNode;
        
        // Create editable div
        const editableDiv = document.createElement('div');
        editableDiv.className = 'rich-text-editor';
        editableDiv.contentEditable = true;
        
        // Create hidden textarea to store HTML content
        const hiddenTextarea = document.createElement('textarea');
        hiddenTextarea.className = 'reply-content';
        hiddenTextarea.style.display = 'none';
        
        if (textarea.value) {
            editableDiv.innerHTML = textarea.value;
        }
        
        // Create toolbar
        const toolbarContainer = document.createElement('div');
        toolbarContainer.className = 'rich-text-toolbar';
        
        const formattingOptions = [
            { name: 'bold', icon: '𝐁', title: 'Bold (Ctrl+B)' },
            { name: 'italic', icon: '𝐼', title: 'Italic (Ctrl+I)' },
            { name: 'underline', icon: '𝐔', title: 'Underline (Ctrl+U)' },
            { name: 'separator', icon: '|', title: '', isStatic: true },
            { name: 'unordered-list', icon: '• List', title: 'Bullet List' },
            { name: 'ordered-list', icon: '1. List', title: 'Numbered List' },
            { name: 'separator', icon: '|', title: '', isStatic: true },
            { name: 'link', icon: '🔗', title: 'Insert Link' }
        ];
        
        formattingOptions.forEach(option => {
            if (option.isStatic) {
                const separator = document.createElement('span');
                separator.className = 'toolbar-separator';
                separator.textContent = option.icon;
                toolbarContainer.appendChild(separator);
                return;
            }
            
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'format-btn';
            button.setAttribute('data-format', option.name);
            button.title = option.title;
            button.textContent = option.icon;
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                applyFormatting(this.getAttribute('data-format'), editableDiv);
            });
            
            toolbarContainer.appendChild(button);
        });
        
        // Replace the original textarea with our editor components
        container.replaceChild(editableDiv, textarea);
        container.insertBefore(toolbarContainer, editableDiv);
        container.appendChild(hiddenTextarea);
        
        // Add event listeners
        editableDiv.addEventListener('input', function() {
            hiddenTextarea.value = this.innerHTML;
        });
        
        editableDiv.addEventListener('keydown', function(e) {
            handleShortcuts(e, editableDiv);
        });
        
        editableDiv.addEventListener('mouseup', function() {
            updateToolbarState(toolbarContainer);
        });
        
        editableDiv.addEventListener('keyup', function() {
            updateToolbarState(toolbarContainer);
        });
        
        // Initialize value
        hiddenTextarea.value = editableDiv.innerHTML;
        
        return {
            editor: editableDiv,
            hiddenTextarea: hiddenTextarea,
            toolbar: toolbarContainer
        };
    }
    
    // Apply formatting to selected text
    function applyFormatting(format, editor) {
        editor.focus();
        
        // Use execCommand for formatting
        switch(format) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
                
            case 'italic':
                document.execCommand('italic', false, null);
                break;
                
            case 'underline':
                try {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const selectedText = range.toString().trim();
                        
                        if (selectedText) {
                            let parentElement = selection.anchorNode;
                            
                            if (parentElement.nodeType === 3) { // Text node
                                parentElement = parentElement.parentNode;
                            }
                            
                            if (parentElement.tagName === 'U' || 
                                (parentElement.parentNode && parentElement.parentNode.tagName === 'U')) {
                                
                                const underlineElement = parentElement.tagName === 'U' ? 
                                    parentElement : parentElement.parentNode;
                                
                                const fragment = document.createDocumentFragment();
                                
                                while (underlineElement.firstChild) {
                                    fragment.appendChild(underlineElement.firstChild);
                                }
                                
                                underlineElement.parentNode.replaceChild(fragment, underlineElement);
                                return;
                            }
                        }
                    }
                    
                    document.execCommand('underline', false, null);
                    
                    const updatedSelection = window.getSelection();
                    if (updatedSelection.rangeCount > 0 && !document.queryCommandState('underline')) {
                        const range = updatedSelection.getRangeAt(0);
                        if (range.toString().trim()) {
                            const underlineElement = document.createElement('u');
                            range.surroundContents(underlineElement);
                        }
                    }
                } catch(e) {
                    console.error('Underline error:', e);
                }
                break;
                
            case 'unordered-list':
                document.execCommand('insertUnorderedList', false, null);
                break;
                
            case 'ordered-list':
                document.execCommand('insertOrderedList', false, null);
                break;
                
            case 'link':
                const url = prompt('Enter URL:', 'https://');
                if (url) {
                    document.execCommand('createLink', false, url);
                    const links = editor.querySelectorAll('a');
                    links.forEach(link => {
                        if (link.getAttribute('href') === url) {
                            link.setAttribute('target', '_blank');
                        }
                    });
                }
                break;
        }
        
        // Update the hidden textarea with the HTML content
        const hiddenTextarea = editor.nextElementSibling;
        if (hiddenTextarea && hiddenTextarea.tagName === 'TEXTAREA') {
            hiddenTextarea.value = editor.innerHTML;
        }
    }
    
    // Handle keyboard shortcuts
    function handleShortcuts(e, editor) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyFormatting('bold', editor);
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormatting('italic', editor);
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormatting('underline', editor);
                    break;
            }
        }
    }
    
    // Update toolbar button states based on current selection
    function updateToolbarState(toolbar) {
        const isBold = document.queryCommandState('bold');
        const isItalic = document.queryCommandState('italic');
        const isUnderline = document.queryCommandState('underline');
        const isUnorderedList = document.queryCommandState('insertUnorderedList');
        const isOrderedList = document.queryCommandState('insertOrderedList');
        
        const boldButton = toolbar.querySelector('[data-format="bold"]');
        const italicButton = toolbar.querySelector('[data-format="italic"]');
        const underlineButton = toolbar.querySelector('[data-format="underline"]');
        const unorderedListButton = toolbar.querySelector('[data-format="unordered-list"]');
        const orderedListButton = toolbar.querySelector('[data-format="ordered-list"]');
        
        if (boldButton) boldButton.classList.toggle('active', isBold);
        if (italicButton) italicButton.classList.toggle('active', isItalic);
        if (underlineButton) underlineButton.classList.toggle('active', isUnderline);
        if (unorderedListButton) unorderedListButton.classList.toggle('active', isUnorderedList);
        if (orderedListButton) orderedListButton.classList.toggle('active', isOrderedList);
    }
    
    // Add necessary CSS if not already present
    function addRichTextStyles() {
        if (document.getElementById('rich-text-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'rich-text-styles';
        style.textContent = `
            .rich-text-toolbar {
                margin-bottom: 5px;
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 4px 4px 0 0;
                background: #f9f9f9;
                display: flex;
                flex-wrap: wrap;
            }
            .format-btn {
                margin: 2px;
                padding: 5px 10px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 3px;
                cursor: pointer;
                font-size: 14px;
            }
            .format-btn:hover {
                background: #f0f0f0;
            }
            .format-btn.active {
                background: #e6f2ff;
                border-color: #99ccff;
            }
            .toolbar-separator {
                margin: 0 5px;
                color: #ccc;
                align-self: center;
            }
            .rich-text-editor {
                min-height: 80px;
                border: 1px solid #ccc;
                border-radius: 0 0 4px 4px;
                padding: 8px;
                overflow-y: auto;
                background-color: white;
                margin-bottom: 10px;
            }
            .rich-text-editor:focus {
                outline: none;
                border-color: #66afe9;
                box-shadow: 0 0 5px rgba(102, 175, 233, 0.5);
            }
            .rich-text-editor ul, .rich-text-editor ol {
                padding-left: 25px;
            }
            .rich-text-editor u {
                text-decoration: underline !important;
            }
            .reply-to-reply-form-container .rich-text-toolbar,
            .edit-reply-form-container .rich-text-toolbar {
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add rich text styles to document
    addRichTextStyles();
    
    // Function to initialize rich text editors for forms when they're displayed
    function setupRichTextForElement(formContainer) {
        if (!formContainer) return;
        
        const textarea = formContainer.querySelector('textarea.reply-content');
        if (textarea && !formContainer.classList.contains('rich-text-initialized')) {
            createRichTextEditor(textarea);
            formContainer.classList.add('rich-text-initialized');
        }
    }
    
    // Toggle reply form for reviews with rich text support
    document.querySelectorAll('.reply-toggle-btn').forEach(button => {
        button.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-review-id');
            const formContainer = this.closest('.reply-actions').nextElementSibling;
            
            // Toggle form visibility
            if (formContainer.style.display === 'none' || !formContainer.style.display) {
                formContainer.style.display = 'block';
                this.textContent = 'Cancel';
                
                // Initialize rich text editor when form is shown
                setupRichTextForElement(formContainer);
            } else {
                formContainer.style.display = 'none';
                this.textContent = 'Reply';
            }
        });
    });

    // Variables for delete reply confirmation
    let currentReplyId = null;
    let currentReviewId = null;
    const deleteReplyPopup = document.getElementById("deleteReplyConfirmPopup");
    const backdrop = document.getElementById("backdrop");
    
    // Function to show/hide delete reply confirmation popup
    function toggleDeleteReplyPopup(show, replyId = null, reviewId = null) {
        if (show) {
            currentReplyId = replyId;
            currentReviewId = reviewId;
        }
        
        deleteReplyPopup.style.display = show ? "block" : "none";
        backdrop.style.display = show ? "block" : "none";
    }
    
    // Close popup when clicking the X button
    document.getElementById("closeDeleteReplyConfirm").addEventListener("click", function() {
        toggleDeleteReplyPopup(false);
    });
    
    // Cancel button closes popup
    document.getElementById("cancelDeleteReply").addEventListener("click", function() {
        toggleDeleteReplyPopup(false);
    });
    
    // Confirm delete button
    document.getElementById("confirmDeleteReply").addEventListener("click", function() {
        if (!currentReplyId || !currentReviewId) return;
        
        deleteReply(currentReplyId, currentReviewId);
        toggleDeleteReplyPopup(false);
    });
    
    // CONSOLIDATED EVENT HANDLERS - Handle all form submissions
    document.addEventListener('submit', async function(e) {
        // Handle reply form submission (for both review replies and nested replies)
        if (e.target.classList.contains('reply-form')) {
            e.preventDefault();
            
            const reviewId = e.target.getAttribute('data-review-id');
            const parentId = e.target.getAttribute('data-parent-id') || null;
            
            // Find the rich text editor content
            let content = "";
            const richTextEditor = e.target.querySelector('.rich-text-editor');
            const hiddenTextarea = e.target.querySelector('textarea.reply-content');
            
            if (richTextEditor) {
                content = richTextEditor.innerHTML;
                if (hiddenTextarea) {
                    hiddenTextarea.value = content;
                }
            } else if (hiddenTextarea) {
                content = hiddenTextarea.value.trim();
            }
            
            if (!content) {
                alert('Please enter a reply');
                return;
            }
            
            try {
                const response = await fetch('/api/replies/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        review_id: reviewId,
                        content: content,
                        parent_id: parentId,
                        isHtml: true // Flag to indicate content has HTML
                    })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to add reply');
                }
                
                const result = await response.json();
                
                // Clear and hide form
                if (richTextEditor) {
                    richTextEditor.innerHTML = '';
                }
                if (hiddenTextarea) {
                    hiddenTextarea.value = '';
                }
                e.target.parentElement.style.display = 'none';
                
                // Handle different form types
                if (parentId) {
                    // This is a reply to a reply
                    const parentForm = e.target.closest('.reply-to-reply-form-container');
                    if (parentForm) {
                        const replyBtn = parentForm.previousElementSibling.querySelector('.reply-to-reply-btn');
                        if (replyBtn) {
                            replyBtn.textContent = 'Reply';
                        }
                        parentForm.style.display = 'none';
                    }
                } else {
                    // This is a reply to the review
                    const formContainer = e.target.closest('.reply-to-reply-form-container');
                    if (formContainer) {
                        const actionContainer = formContainer.previousElementSibling;
                        const toggleBtn = actionContainer.querySelector('.reply-toggle-btn');
                        if (toggleBtn) {
                            toggleBtn.textContent = 'Reply';
                        }
                        formContainer.style.display = 'none';
                    }
                }
                
                // Reload all replies for this review
                loadReplies(reviewId);
                
            } catch (error) {
                console.error('Error adding reply:', error);
                alert('Failed to add reply: ' + error.message);
            }
        }
        
        // Handle edit reply form submission
        if (e.target.classList.contains('edit-reply-form')) {
            e.preventDefault();
            
            const replyId = e.target.getAttribute('data-reply-id');
            const reviewId = e.target.getAttribute('data-review-id');
            
            // Find the rich text editor content
            let content = "";
            const richTextEditor = e.target.querySelector('.rich-text-editor');
            const contentTextarea = e.target.querySelector('.edit-reply-content');
            
            if (richTextEditor) {
                content = richTextEditor.innerHTML;
            } else if (contentTextarea) {
                content = contentTextarea.value.trim();
            }
            
            if (!content) {
                alert('Please enter a reply');
                return;
            }
            
            try {
                const response = await fetch('/api/replies/edit', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        reply_id: replyId,
                        content: content,
                        isHtml: true // Flag to indicate content has HTML
                    })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update reply');
                }
                
                const result = await response.json();
                
                // Hide the edit form
                e.target.parentElement.style.display = 'none';
                
                // Reload all replies to update the UI
                loadReplies(reviewId);
                
            } catch (error) {
                console.error('Error updating reply:', error);
                alert('Failed to update reply: ' + error.message);
            }
        }
    });
    
    // CONSOLIDATED EVENT HANDLERS - Handle all click events
    document.addEventListener('click', function(e) {
        // Handle reply to reply clicks
        if (e.target.classList.contains('reply-to-reply-btn')) {
            const replyId = e.target.getAttribute('data-reply-id');
            const reviewId = e.target.getAttribute('data-review-id');
            const formContainer = e.target.closest('.reply-actions').nextElementSibling;
            
            // Make sure we're targeting the correct container
            if (formContainer && formContainer.classList.contains('reply-to-reply-form-container')) {
                // Toggle form visibility
                if (formContainer.style.display === 'none' || !formContainer.style.display) {
                    formContainer.style.display = 'block';
                    e.target.textContent = 'Cancel';
                    
                    // Initialize rich text editor when form is shown
                    setupRichTextForElement(formContainer);
                } else {
                    formContainer.style.display = 'none';
                    e.target.textContent = 'Reply';
                }
            }
        }
        
        // Cancel button for any reply form
        if (e.target.classList.contains('cancel-reply-btn')) {
            const form = e.target.closest('.reply-form');
            const formContainer = form.closest('.reply-to-reply-form-container');
            
            let toggleButton;
            
            if (formContainer) {
                // Find the associated toggle button
                const actionsContainer = formContainer.previousElementSibling;
                if (actionsContainer && actionsContainer.classList.contains('reply-actions')) {
                    toggleButton = actionsContainer.querySelector('.reply-to-reply-btn') || 
                                actionsContainer.querySelector('.reply-toggle-btn');
                }
                
                // Clear form
                const richTextEditor = form.querySelector('.rich-text-editor');
                if (richTextEditor) {
                    richTextEditor.innerHTML = '';
                }
                const textArea = form.querySelector('textarea.reply-content');
                if (textArea) {
                    textArea.value = '';
                }
                
                formContainer.style.display = 'none';
                
                // Reset button text
                if (toggleButton) {
                    toggleButton.textContent = 'Reply';
                }
            }
        }
        
        // Handle delete reply
        if (e.target.classList.contains('delete-reply')) {
            const replyId = e.target.getAttribute('data-id');
            const reviewId = e.target.closest('.scroll-obj').querySelector('input[name="review_id"]').value;
            
            // Show delete confirmation popup instead of confirm()
            toggleDeleteReplyPopup(true, replyId, reviewId);
        }
        
        // Handle edit reply button click
        if (e.target.classList.contains('edit-reply')) {
            const replyItem = e.target.closest('.reply-item');
            const replyId = e.target.getAttribute('data-id');
            const replyContent = replyItem.querySelector('p').innerHTML;
            
            // Show edit form and populate with current content
            const editForm = replyItem.querySelector('.edit-reply-form-container');
            
            // Initialize rich text editor if needed
            if (!editForm.classList.contains('rich-text-initialized')) {
                const textArea = editForm.querySelector('.edit-reply-content');
                if (textArea) {
                    textArea.value = replyContent; // Set the content before creating the editor
                    createRichTextEditor(textArea);
                    editForm.classList.add('rich-text-initialized');
                } else {
                    // If textarea wasn't found, populate the rich editor directly if it exists
                    const richEditor = editForm.querySelector('.rich-text-editor');
                    if (richEditor) {
                        richEditor.innerHTML = replyContent;
                    }
                }
            } else {
                // Form already has rich text - update the content
                const richEditor = editForm.querySelector('.rich-text-editor');
                if (richEditor) {
                    richEditor.innerHTML = replyContent;
                }
                const hiddenTextarea = editForm.querySelector('textarea.edit-reply-content');
                if (hiddenTextarea) {
                    hiddenTextarea.value = replyContent;
                }
            }
            
            // Show edit form
            editForm.style.display = 'block';
        }
        
        // Handle cancel edit button
        if (e.target.classList.contains('cancel-edit-reply-btn')) {
            const editForm = e.target.closest('.edit-reply-form-container');
            editForm.style.display = 'none';
        }
    });
    
    // Load existing replies for each review
    document.querySelectorAll('.scroll-obj').forEach(reviewElement => {
        const reviewId = reviewElement.querySelector('input[name="review_id"]');
        if (reviewId) {
            loadReplies(reviewId.value);
        } else {
            console.warn('Review element found without review_id input:', reviewElement);
        }
    });
});

// Delete a reply
async function deleteReply(replyId, reviewId) {
    try {
        console.log(`Deleting reply ${replyId} from review ${reviewId}`);
        const response = await fetch('/api/replies/archive', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reply_id: replyId
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete reply');
        }
        
        // Reload all replies to update the UI
        loadReplies(reviewId);
        
    } catch (error) {
        console.error('Error deleting reply:', error);
        alert('Failed to delete reply: ' + error.message);
    }
}

// Load replies for a review
async function loadReplies(reviewId) {
    try {
        console.log(`Fetching replies for review ${reviewId}`);
        const response = await fetch(`/api/replies/${reviewId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load replies');
        }
        
        const data = await response.json();
        
        // Get the container for this review's replies
        const reviewInput = document.querySelector(`input[name="review_id"][value="${reviewId}"]`);
        if (!reviewInput) {
            // Try alternate selectors if the first one fails
            const alternateInput = document.querySelector(`#hidden-review-id[value="${reviewId}"]`);
            if (!alternateInput) {
                console.error(`No input element found with reviewId ${reviewId}`);
                return;
            }
        }
        
        const reviewElement = reviewInput.closest('.scroll-obj');
        const repliesContainer = reviewElement.querySelector('.review-replies');
        
        if (!repliesContainer) {
            console.error(`No .review-replies container found for review ${reviewId}`);
            return;
        }
        
        // Clear existing replies
        repliesContainer.innerHTML = '';
        
        // Add each reply to the UI
        if (data.success && data.replies && data.replies.length > 0) {
            data.replies.forEach(reply => {
                addReplyToUI(reviewId, reply, repliesContainer);
            });
        }

        // Recreate the reply action elements
        const newToggleBtn = document.createElement('div');
        newToggleBtn.className = 'reply-actions';
        newToggleBtn.innerHTML = `
            <button class="reply-toggle-btn" data-review-id="${reviewId}">Reply</button>
            <span class="reply-date"></span>
        `;
        repliesContainer.appendChild(newToggleBtn);

        const newFormContainer = document.createElement('div');
        newFormContainer.className = 'reply-to-reply-form-container';
        newFormContainer.style.display = 'none';
        newFormContainer.innerHTML = `
            <form class="reply-form" data-review-id="${reviewId}">
                <textarea class="reply-content" placeholder="Write your reply..." required></textarea>
                <div class="reply-buttons">
                    <button type="submit" class="submit-reply-btn">Submit</button>
                    <button type="button" class="cancel-reply-btn">Cancel</button>
                </div>
            </form>
        `;
        repliesContainer.appendChild(newFormContainer);
        
        // Add event listener to the new reply toggle button
        const newButton = newToggleBtn.querySelector('.reply-toggle-btn');
        if (newButton) {
            newButton.addEventListener('click', function() {
                const formContainer = this.closest('.reply-actions').nextElementSibling;
                
                // Toggle form visibility
                if (formContainer.style.display === 'none' || !formContainer.style.display) {
                    formContainer.style.display = 'block';
                    this.textContent = 'Cancel';
                    
                    // Initialize rich text editor
                    const textarea = formContainer.querySelector('textarea.reply-content');
                    if (textarea && !formContainer.classList.contains('rich-text-initialized')) {
                        const container = textarea.parentNode;
                        createRichTextEditor(textarea);
                        formContainer.classList.add('rich-text-initialized');
                    }
                } else {
                    formContainer.style.display = 'none';
                    this.textContent = 'Reply';
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading replies:', error);
    }
}

// Helper function to create rich text editor for a textarea
function createRichTextEditor(textarea) {
    if (!textarea) return null;
    
    const container = textarea.parentNode;
    
    // Create editable div
    const editableDiv = document.createElement('div');
    editableDiv.className = 'rich-text-editor';
    editableDiv.contentEditable = true;
    
    if (textarea.value) {
        editableDiv.innerHTML = textarea.value;
    }
    
    // Create toolbar
    const toolbarContainer = document.createElement('div');
    toolbarContainer.className = 'rich-text-toolbar';
    
    const formattingOptions = [
        { name: 'bold', icon: '𝐁', title: 'Bold (Ctrl+B)' },
        { name: 'italic', icon: '𝐼', title: 'Italic (Ctrl+I)' },
        { name: 'underline', icon: '𝐔', title: 'Underline (Ctrl+U)' },
        { name: 'separator', icon: '|', title: '', isStatic: true },
        { name: 'unordered-list', icon: '• List', title: 'Bullet List' },
        { name: 'ordered-list', icon: '1. List', title: 'Numbered List' },
        { name: 'separator', icon: '|', title: '', isStatic: true },
        { name: 'link', icon: '🔗', title: 'Insert Link' }
    ];
    
    formattingOptions.forEach(option => {
        if (option.isStatic) {
            const separator = document.createElement('span');
            separator.className = 'toolbar-separator';
            separator.textContent = option.icon;
            toolbarContainer.appendChild(separator);
            return;
        }
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'format-btn';
        button.setAttribute('data-format', option.name);
        button.title = option.title;
        button.textContent = option.icon;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            applyFormatting(this.getAttribute('data-format'), editableDiv);
        });
        
        toolbarContainer.appendChild(button);
    });
    
    // Hide original textarea but keep for form submission
    textarea.style.display = 'none';
    
    // Insert our components
    container.insertBefore(toolbarContainer, textarea);
    container.insertBefore(editableDiv, textarea);
    
    // Add event listeners
    editableDiv.addEventListener('input', function() {
        textarea.value = this.innerHTML;
    });
    
    editableDiv.addEventListener('keydown', function(e) {
        handleShortcuts(e, editableDiv);
    });
    
    editableDiv.addEventListener('mouseup', function() {
        updateToolbarState(toolbarContainer);
    });
    
    editableDiv.addEventListener('keyup', function() {
        updateToolbarState(toolbarContainer);
    });
    
    // Initialize value
    textarea.value = editableDiv.innerHTML;
    
    return {
        editor: editableDiv,
        textarea: textarea,
        toolbar: toolbarContainer
    };
}

// Apply formatting to selected text
function applyFormatting(format, editor) {
    editor.focus();
    
    // Use execCommand for formatting
    switch(format) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
        case 'italic':
            document.execCommand('italic', false, null);
            break;
        case 'underline':
            document.execCommand('underline', false, null);
            break;
        case 'unordered-list':
            document.execCommand('insertUnorderedList', false, null);
            break;
        case 'ordered-list':
            document.execCommand('insertOrderedList', false, null);
            break;
        case 'link':
            const url = prompt('Enter URL:', 'https://');
            if (url) {
                document.execCommand('createLink', false, url);
                const links = editor.querySelectorAll('a');
                links.forEach(link => {
                    if (link.getAttribute('href') === url) {
                        link.setAttribute('target', '_blank');
                    }
                });
            }
            break;
    }
    
    // Update hidden textarea with HTML content
    const textarea = editor.nextElementSibling;
    if (textarea && textarea.tagName === 'TEXTAREA') {
        textarea.value = editor.innerHTML;
    }
}

// Handle keyboard shortcuts
function handleShortcuts(e, editor) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                applyFormatting('bold', editor);
                break;
            case 'i':
                e.preventDefault();
                applyFormatting('italic', editor);
                break;
            case 'u':
                e.preventDefault();
                applyFormatting('underline', editor);
                break;
        }
    }
}

// Update toolbar button states based on current selection
function updateToolbarState(toolbar) {
    try {
        const isBold = document.queryCommandState('bold');
        const isItalic = document.queryCommandState('italic');
        const isUnderline = document.queryCommandState('underline');
        const isUnorderedList = document.queryCommandState('insertUnorderedList');
        const isOrderedList = document.queryCommandState('insertOrderedList');
        
        const boldButton = toolbar.querySelector('[data-format="bold"]');
        const italicButton = toolbar.querySelector('[data-format="italic"]');
        const underlineButton = toolbar.querySelector('[data-format="underline"]');
        const unorderedListButton = toolbar.querySelector('[data-format="unordered-list"]');
        const orderedListButton = toolbar.querySelector('[data-format="ordered-list"]');
        
        if(boldButton) boldButton.classList.toggle('active', isBold);
        if(italicButton) italicButton.classList.toggle('active', isItalic);
        if(underlineButton) underlineButton.classList.toggle('active', isUnderline);
        if(unorderedListButton) unorderedListButton.classList.toggle('active', isUnorderedList);
        if(orderedListButton) orderedListButton.classList.toggle('active', isOrderedList);
    } catch(e) {
        console.error('Error updating toolbar state:', e);
    }
}

// Recursively add replies and their children to the UI
function addReplyToUI(reviewId, reply, container) {
    // Create reply element
    const replyElement = document.createElement('div');
    replyElement.className = 'reply-item';
    replyElement.setAttribute('data-id', reply.reply_id);
    
    // Build reply HTML
    let replyHTML = `
        <div class="reply-header">
    `;
    
    if (reply.account_id) {
        replyHTML += `
            <a href="/profile/${reply.account_id.acc_id}">
                <img src="${reply.account_id.profile_pic || '../views/images/profilePictures/default-profile.png'}" 
                     alt="Profile" class="profile-pic-small" 
                     onerror="this.src='/images/profilePictures/default-profile.png'"> 
                ${reply.account_id.acc_name}
            </a>
        `;
    } else {
        replyHTML += `
            <span>
                <img src="../views/images/profilePictures/default-profile.png" alt="Profile" class="profile-pic-small">
                Anonymous
            </span>
        `;
    }
       
    if (reply.canDelete) {
        replyHTML += `
            <button class="delete-reply" data-id="${reply.reply_id}">🗑️</button>
            <button class="edit-reply" data-id="${reply.reply_id}">✏️</button>
        `;
    }
    
    replyHTML += `
            </div>
            <p>${reply.content}</p>
            
            <!-- Add edit form container here -->
            <div class="edit-reply-form-container" style="display: none;">
                <form class="edit-reply-form" data-reply-id="${reply.reply_id}" data-review-id="${reviewId}">
                    <textarea class="edit-reply-content" placeholder="Edit your reply..." required></textarea>
                    <div class="reply-buttons">
                        <button type="submit" class="submit-edit-reply-btn">Update</button>
                        <button type="button" class="cancel-edit-reply-btn">Cancel</button>
                    </div>
                </form>
            </div>
            
            <div class="reply-actions">
                <button class="reply-to-reply-btn" data-reply-id="${reply.reply_id}" data-review-id="${reviewId}">Reply</button>
                <span class="reply-date">
                    ${reply.isEdited ? 'Last Edited: ' + reply.editedDate : 'Posted on ' + reply.created_at}
                </span>
            </div>
            <div class="reply-to-reply-form-container" style="display: none;">
                <form class="reply-form" data-review-id="${reviewId}" data-parent-id="${reply.reply_id}">
                    <textarea class="reply-content" placeholder="Write your reply..." required></textarea>
                    <div class="reply-buttons">
                        <button type="submit" class="submit-reply-btn">Submit</button>
                        <button type="button" class="cancel-reply-btn">Cancel</button>
                    </div>
                </form>
            </div>
    `;
    
    replyElement.innerHTML = replyHTML;
    container.appendChild(replyElement);
    
    // Add children if any
    if (reply.children && reply.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'reply-children';
        replyElement.appendChild(childrenContainer);
        
        reply.children.forEach(childReply => {
            addReplyToUI(reviewId, childReply, childrenContainer);
        });
    }
}