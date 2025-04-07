// Replace the entire file with this fixed version
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded for edit review functionality");
    
    // Setup for star rating in edit form
    let editSelectedRating = 0;
    
    function createRichTextEditorForEdit() {
        const reviewContentContainer = document.getElementById('edit-review-content').parentNode;
        const existingTextarea = document.getElementById('edit-review-content');
        if (!existingTextarea) return;
        
        const existingToolbar = reviewContentContainer.querySelector('.rich-text-toolbar');
        if (existingToolbar) {
            existingToolbar.remove();
        }
        
        const editableDiv = document.createElement('div');
        editableDiv.id = 'edit-review-content-editor';
        editableDiv.className = 'rich-text-editor';
        editableDiv.contentEditable = true;
        
        if (existingTextarea.value) {
            editableDiv.innerHTML = existingTextarea.value;
        }
    
        const hiddenTextarea = document.createElement('textarea');
        hiddenTextarea.id = 'edit-review-content';
        hiddenTextarea.name = existingTextarea.name;
        hiddenTextarea.style.display = 'none';
    
        reviewContentContainer.replaceChild(editableDiv, existingTextarea);
        reviewContentContainer.appendChild(hiddenTextarea);
        
        const toolbarContainer = document.createElement('div');
        toolbarContainer.className = 'rich-text-toolbar';
        editableDiv.parentNode.insertBefore(toolbarContainer, editableDiv);
        
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
                applyFormatting(this.getAttribute('data-format'));
            });
            
            toolbarContainer.appendChild(button);
        });
        
        editableDiv.addEventListener('keydown', handleShortcuts);
        
        editableDiv.addEventListener('input', function() {
            hiddenTextarea.value = this.innerHTML;
        });
        
        editableDiv.addEventListener('mouseup', updateToolbarState);
        editableDiv.addEventListener('keyup', updateToolbarState);
        editableDiv.addEventListener('click', updateToolbarState);
        
        hiddenTextarea.value = editableDiv.innerHTML;
        
        return editableDiv;
    }

    function setupEditStarRating() {
        const editStars = document.querySelectorAll('#editReviewModal .star-rating .star');
        if (editStars.length > 0) {
            editStars.forEach(star => {
                star.addEventListener('click', function() {
                    editSelectedRating = parseInt(this.getAttribute('data-value'));
                    
                    // Update stars visual state
                    editStars.forEach(s => {
                        if (parseInt(s.getAttribute('data-value')) <= editSelectedRating) {
                            s.classList.add('selected');
                            s.classList.add('active'); // Add both classes for compatibility
                        } else {
                            s.classList.remove('selected');
                            s.classList.remove('active');
                        }
                    });
                    
                    // Update rating text
                    if (document.getElementById('edit-rating-text')) {
                        document.getElementById('edit-rating-text').textContent = editSelectedRating + ' out of 5';
                    }
                });
            });
        }
    }
    
    // Apply formatting to selected text
    function applyFormatting(format) {
        const editor = document.getElementById('edit-review-content-editor');
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
                    // Check if we need to handle a specific case for removing underline
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const selectedText = range.toString().trim();
                        
                        if (selectedText) {
                            // Check if selection is already underlined
                            let parentElement = selection.anchorNode;
                            
                            // If the parent is a text node, look at its parent
                            if (parentElement.nodeType === 3) { // Text node
                                parentElement = parentElement.parentNode;
                            }
                            
                            // Check if we're directly in or under a <u> tag
                            if (parentElement.tagName === 'U' || 
                                (parentElement.parentNode && parentElement.parentNode.tagName === 'U')) {
                                
                                // Text is already underlined, so remove the underline
                                const underlineElement = parentElement.tagName === 'U' ? 
                                    parentElement : parentElement.parentNode;
                                
                                // Create a document fragment to hold the content
                                const fragment = document.createDocumentFragment();
                                
                                // Move all child nodes from the <u> element to the fragment
                                while (underlineElement.firstChild) {
                                    fragment.appendChild(underlineElement.firstChild);
                                }
                                
                                // Replace the <u> element with the fragment
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
                    
                    // Standard approach for normal cases - adding underline
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
                    const links = editor.querySelectorAll('a');
                    links.forEach(link => {
                        if (link.getAttribute('href') === url) {
                            link.setAttribute('target', '_blank');
                        }
                    });
                }
                break;
        }
        
        updateToolbarState();
        document.getElementById('edit-review-content').value = editor.innerHTML;
    }

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

    function handleShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyFormatting('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormatting('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormatting('underline');
                    break;
            }
        }
    }

    window.toggleEditReviewModal = function() {
        const backdrop = document.getElementById('backdrop');
        const editReviewModal = document.getElementById('editReviewModal');
        
        if (editReviewModal && backdrop) {
            if (editReviewModal.style.display === 'block') {
                editReviewModal.style.display = 'none';
                backdrop.style.display = 'none';
                

                const richEditor = document.getElementById('edit-review-content-editor');
                if (richEditor) {
                    const hiddenInput = document.getElementById('edit-review-content');
                    if (hiddenInput) {
                        const newTextarea = document.createElement('textarea');
                        newTextarea.id = 'edit-review-content';
                        newTextarea.name = hiddenInput.name;
                        newTextarea.className = richEditor.className;
                    
                        richEditor.parentNode.replaceChild(newTextarea, richEditor);
                        
                        if (hiddenInput.parentNode) {
                            hiddenInput.parentNode.removeChild(hiddenInput);
                        }
                    }
                }
            } else {
                editReviewModal.style.display = 'block';
                backdrop.style.display = 'block';
                setupEditStarRating();
            }
        } else {
            console.error('Edit review modal elements not found');
        }
    };
    
    window.openEditReview = function(reviewId) {
        console.log("Opening edit review for ID:", reviewId);
        document.getElementById('edit-review-id').value = reviewId;
        
        let reviewElement;
        try {
            reviewElement = document.querySelector(`.edit-review[data-id="${reviewId}"]`).closest('.scroll-obj');
        } catch (e) {
            try {
                reviewElement = document.querySelector(`#Edit-Review-${reviewId}`).closest('.scroll-obj');
            } catch (e2) {
                console.error("Could not find review element:", e2);
            }
        }
        
        fetch(`/api/reviews/${reviewId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Review data:", data);
                
                const editTextarea = document.getElementById('edit-review-content');
                if (editTextarea) {
                    editTextarea.value = data.review;
                    
                    const editor = createRichTextEditorForEdit();
                    if (editor) {
                        editor.innerHTML = data.review;
                        document.getElementById('edit-review-content').value = data.review;
                    }
                }
                
                editSelectedRating = data.rating || 0;
                const editStars = document.querySelectorAll('#editReviewModal .star-rating .star');
                editStars.forEach(star => {
                    if (parseInt(star.getAttribute('data-value')) <= editSelectedRating) {
                        star.classList.add('selected');
                        star.classList.add('active');
                    } else {
                        star.classList.remove('selected');
                        star.classList.remove('active');
                    }
                });
                
                if (document.getElementById('edit-rating-text')) {
                    document.getElementById('edit-rating-text').textContent = editSelectedRating + ' out of 5';
                }
                
    
                window.toggleEditReviewModal();
            })
            .catch(error => {
                console.error("Error fetching review data:", error);
                alert("Error loading review data: " + error.message);
            });
    };
    
    const editForm = document.forms['edit-review'];
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Edit review form submitted!");
            
            const reviewId = document.getElementById('edit-review-id').value;

            if (editSelectedRating === 0) {
                alert("Please select a rating");
                return;
            }
            
            const editor = document.getElementById('edit-review-content-editor');
            const hiddenTextarea = document.getElementById('edit-review-content');
            
            if (editor && hiddenTextarea) {
                hiddenTextarea.value = editor.innerHTML;
                
                const reviewContent = hiddenTextarea.value;
                if (!reviewContent.trim()) {
                    alert("Please write a review");
                    return;
                }
                
                const reviewData = {
                    review_id: reviewId,
                    rating: editSelectedRating,
                    review: reviewContent,
                    isHtml: true 
                };
                
                console.log("Edit review data to be sent:", reviewData);

                const submitButton = editForm.querySelector('input[type="submit"]');
                if (submitButton) submitButton.disabled = true;
                
                fetch('/api/reviews/edit', {
                    method: 'PUT',
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
                    console.log("Review updated successfully:", data);
                    alert('Review updated successfully!');
                    
                    // Close modal
                    window.toggleEditReviewModal();
                    
                    // Reload page to show the updated review
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error updating review:', error);
                    alert('Failed to update review: ' + error.message);
                })
                .finally(() => {
                    if (submitButton) submitButton.disabled = false;
                });
            } else {
                console.error("Rich text editor or hidden input not found");
                alert("There was a problem with the form. Please try again.");
            }
        });
    } else {
        console.error("Form with name 'edit-review' not found!");
    }
    
    // Handle star rating in the edit modal
    const editStars = document.querySelectorAll('#edit-star-rating .star');
    
    editStars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            
            // Clear all stars first
            editStars.forEach(s => {
                s.classList.remove('active');
                s.classList.remove('selected');
            });
            
            // Then set active stars up to the clicked one
            editStars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('active');
                    s.classList.add('selected');
                }
            });
            
            // Update rating text
            if (document.getElementById('edit-rating-text')) {
                document.getElementById('edit-rating-text').textContent = value + ' out of 5';
            }
            
            // Set the rating value in a hidden field
            editSelectedRating = value;
            
            // Add hidden rating input field if it doesn't exist
            let ratingInput = document.querySelector('form[name="edit-review"] input[name="rating"]');
            if (!ratingInput) {
                ratingInput = document.createElement('input');
                ratingInput.type = 'hidden';
                ratingInput.name = 'rating';
                document.forms['edit-review'].appendChild(ratingInput);
            }
            
            // Set the rating value
            ratingInput.value = value;
        });
    });
});

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Edit review form submitted!");
        
        const reviewId = document.getElementById('edit-review-id').value;
        
        if (editSelectedRating === 0) {
            alert("Please select a rating");
            return;
        }
        
        // Get content from rich text editor
        const editor = document.getElementById('edit-review-content-editor');
        const hiddenTextarea = document.getElementById('edit-review-content');
        
        if (editor && hiddenTextarea) {
            // Update hidden textarea with latest editor content
            hiddenTextarea.value = editor.innerHTML;
            
            // Get review content
            const reviewContent = hiddenTextarea.value;
            if (!reviewContent.trim()) {
                alert("Please write a review");
                return;
            }
            
            // Create review data with HTML content flag
            const reviewData = {
                review_id: reviewId,
                rating: editSelectedRating,
                review: reviewContent,
                isHtml: true // Flag to indicate content has HTML
            };
            
            console.log("Edit review data to be sent:", reviewData);
            
            // Send data to server
            fetch('/api/reviews/edit', {
                method: 'PUT',
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
                console.log("Review updated successfully:", data);
                alert('Review updated successfully!');
                window.toggleEditReviewModal();
                window.location.reload();
            })
            .catch(error => {
                console.error('Error updating review:', error);
                alert('Failed to update review: ' + error.message);
            });
        }
    });