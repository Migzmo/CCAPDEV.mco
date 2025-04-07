/**
 * Main JS file for review creation functions
 * Includes rich text editor bonus for markup
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, looking for form");
    const form = document.forms['create-review'];
    
    //default rating
    let selectedRating = 0;
    
    //rich text and all of its stuff
    function createRichTextEditor() {
        const reviewContentContainer = document.getElementById('review-content').parentNode;
        const existingTextarea = document.getElementById('review-content');
        if (!existingTextarea) return;
        
        const editableDiv = document.createElement('div');
        editableDiv.id = 'review-content-editor';
        editableDiv.className = 'rich-text-editor';
        editableDiv.contentEditable = true;
        
        if (existingTextarea.value) {
            editableDiv.innerHTML = existingTextarea.value;
        }

        const hiddenTextarea = document.createElement('textarea');
        hiddenTextarea.id = 'review-content';
        hiddenTextarea.name = existingTextarea.name;
        hiddenTextarea.style.display = 'none';

        reviewContentContainer.replaceChild(editableDiv, existingTextarea);
        reviewContentContainer.appendChild(hiddenTextarea);
        
        //toolbar for edits for applying styles
        const toolbarContainer = document.createElement('div');
        toolbarContainer.className = 'rich-text-toolbar';
        editableDiv.parentNode.insertBefore(toolbarContainer, editableDiv);
        
        // all the available tootls
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
            
            //adding button listeners for functionality
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'format-btn';
            button.setAttribute('data-format', option.name);
            button.title = option.title;
            button.textContent = option.icon;
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                applyFormatting(this.getAttribute('data-format'));
            });
            
            toolbarContainer.appendChild(button);
        });
        
        // ++CSS styling for the toolbar and editor
        const style = document.createElement('style');
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
                min-height: 150px;
                border: 1px solid #ccc;
                border-radius: 0 0 4px 4px;
                padding: 8px;
                overflow-y: auto;
                background-color: white;
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
        `;
        document.head.appendChild(style);
        
        editableDiv.addEventListener('keydown', handleShortcuts);
        
        editableDiv.addEventListener('input', function() {
            hiddenTextarea.value = this.innerHTML;
        });
        
        editableDiv.addEventListener('mouseup', updateToolbarState);
        editableDiv.addEventListener('keyup', updateToolbarState);
        editableDiv.addEventListener('click', updateToolbarState);
        
        hiddenTextarea.value = editableDiv.innerHTML;
    }
    
    // Update toolbar button states based on current selection
    function updateToolbarState() {
        try {
            const isBold = document.queryCommandState('bold');
            const isItalic = document.queryCommandState('italic');
            const isUnderline = document.queryCommandState('underline');
            const isUnorderedList = document.queryCommandState('insertUnorderedList');
            const isOrderedList = document.queryCommandState('insertOrderedList');
            
            const boldButton = document.querySelector('[data-format="bold"]');
            const italicButton = document.querySelector('[data-format="italic"]');
            const underlineButton = document.querySelector('[data-format="underline"]');
            const unorderedListButton = document.querySelector('[data-format="unordered-list"]');
            const orderedListButton = document.querySelector('[data-format="ordered-list"]');
            
            if(boldButton) boldButton.classList.toggle('active', isBold);
            if(italicButton) italicButton.classList.toggle('active', isItalic);
            if(underlineButton) underlineButton.classList.toggle('active', isUnderline);
            if(unorderedListButton) unorderedListButton.classList.toggle('active', isUnorderedList);
            if(orderedListButton) orderedListButton.classList.toggle('active', isOrderedList);
        } catch(e) {
            console.error('Error updating toolbar state:', e);
        }
    }
    
    // Apply formatting to selected text
    function applyFormatting(format) {
        const editor = document.getElementById('review-content-editor');
        editor.focus();
        
        // Use execCommand for formatting
        switch(format) {
            case 'bold':
                document.execCommand('bold', false, null);
                console.log('Applied bold formatting');
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                console.log('Applied italic formatting');
                break;
            case 'underline':
                try {
                    // Check if we need to handle a specific case for removing underline
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const selectedText = range.toString().trim();
                        
                        if (selectedText) {
                            // Check if selection is already underlined
                            let parentElement = selection.anchorNode;
                            
                            if (parentElement.nodeType === 3) { 
                                parentElement = parentElement.parentNode;
                            }
                            
                            // Check if we're directly in or under a <u> tag
                            if (parentElement.tagName === 'U' || 
                                (parentElement.parentNode && parentElement.parentNode.tagName === 'U')) {
                                
                                // Iff text is already underlined, so remove the underline
                                const underlineElement = parentElement.tagName === 'U' ? 
                                    parentElement : parentElement.parentNode;

                                const fragment = document.createDocumentFragment();

                                while (underlineElement.firstChild) {
                                    fragment.appendChild(underlineElement.firstChild);
                                }

                                underlineElement.parentNode.replaceChild(fragment, underlineElement);
                                
                                // Update the hidden textarea with the modified content
                                const hiddenTextarea = document.getElementById('review-content');
                                hiddenTextarea.value = editor.innerHTML;
                                console.log("Removed underline, updated content:", hiddenTextarea.value);
                                
                                // Early return to avoid executing the standard execCommand
                                return;
                            }
                        }
                    }
                    
                    document.execCommand('underline', false, null);
                    console.log('Applied underline formatting');
                    
                    if (selection.rangeCount > 0 && !document.queryCommandState('underline')) {
                        const range = selection.getRangeAt(0);
                        if (range.toString().trim()) {
                            const underlineElement = document.createElement('u');
                            range.surroundContents(underlineElement);
                        }
                    }
                    
                    const hiddenTextarea = document.getElementById('review-content');
                    hiddenTextarea.value = editor.innerHTML;
                    console.log("Saved underlined content:", hiddenTextarea.value);
                } catch(e) {
                    console.error('Underline error:', e);
                    
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        if (range.toString().trim()) {
                            const isUnderlined = document.queryCommandState('underline');
                            if (isUnderlined) {
                                const selectedText = range.toString();
                                document.execCommand('insertHTML', false, selectedText);
                            } else {
                                const selectedHtml = range.toString();
                                document.execCommand('insertHTML', false, '<u>' + selectedHtml + '</u>');
                            }
                        }
                    }
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

                    // Make links open in new tab
                    const links = editor.querySelectorAll('a');
                    links.forEach(link => {
                        if (link.getAttribute('href') === url) {
                            link.setAttribute('target', '_blank');
                        }
                    });
                }
                break;
        }

        // Update toolbar state after applying formatting
        updateToolbarState();
        
        // Update hidden textarea with HTML content
        document.getElementById('review-content').value = editor.innerHTML;
    }
    
    // Handle keyboard shortcuts + logs
    function handleShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyFormatting('bold');
                    console.log('Bold shortcut activated');
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormatting('italic');
                    console.log('Italic shortcut activated');
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormatting('underline');
                    console.log('Underline shortcut activated');
                    break;
            }
        }
    }
    
    // Initialize rich text editor
    createRichTextEditor();
    
    // Star rating functionality
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-value'));
            
            // Update stars visual state
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= selectedRating) {
                    s.classList.add('selected');
                    s.classList.add('active'); // Add both classes for compatibility
                } else {
                    s.classList.remove('selected');
                    s.classList.remove('active');
                }
            });
            
            // Update rating text
            document.getElementById('rating-text').textContent = selectedRating + ' out of 5';
        });
    });
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Review form submitted!");
            
            // Get restaurant ID from URL
            const pathSegments = window.location.pathname.split('/');
            const resto_id = pathSegments[pathSegments.length - 1];
            
            // Validate rating
            if (selectedRating === 0) {
                alert("Please select a rating");
                return;
            }
            
            // Update hidden textarea with latest editor content
            const editor = document.getElementById('review-content-editor');
            const hiddenTextarea = document.getElementById('review-content');
            hiddenTextarea.value = editor.innerHTML;
            
            // Get review content
            const reviewContent = hiddenTextarea.value;
            if (!reviewContent.trim()) {
                alert("Please write a review");
                return;
            }
            
            // Create review data
            const reviewData = {
                resto_id: resto_id,
                rating: selectedRating,
                review: reviewContent,
                isHtml: true 
            }; 
            
            console.log("Review data to be sent:", reviewData);
            
            const submitButton = form.querySelector('input[type="submit"]');
            if (submitButton) submitButton.disabled = true;
            
            fetch('/api/reviews/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Server error');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log("Review submitted successfully:", data);
                alert('Review submitted successfully!');
                
                if (typeof toggleReviewModal === 'function') {
                    toggleReviewModal();
                }
                
                window.location.reload();
            })
            .catch(error => {
                console.error('Error submitting review:', error);
                alert('Failed to submit review: ' + error.message);
            })
            .finally(() => {
                if (submitButton) submitButton.disabled = false;
            });
        });
    } else {
        console.error("Form with name 'create-review' not found!");
    }
});