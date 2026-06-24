// ============================================
// Google Analytics Helper Functions
// ============================================

/**
 * Track event to Google Analytics
 * @param {string} eventName - Name of the event
 * @param {Object} eventParams - Event parameters
 */
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag === 'function' && localStorage.getItem('analytics_consent') === 'granted') {
        gtag('event', eventName, eventParams);
        console.log(`[Analytics] ${eventName}`, eventParams);
    }
}

// ============================================
// State Management
// ============================================

let state = {
    discussions: [],
    categories: [],
    filters: {
        search: '',
        category: '',
        sortBy: 'newest'
    },
    selectedDiscussionId: null
};

// ============================================
// API Functions
// ============================================

async function fetchDiscussions() {
    try {
        const response = await fetch('/api/discussions?first=100');
        if (!response.ok) throw new Error('Failed to fetch discussions');
        const data = await response.json();
        return data.data?.repository?.discussions?.nodes || [];
    } catch (error) {
        console.error('Error fetching discussions:', error);
        return [];
    }
}

async function fetchCategories() {
    try {
        const response = await fetch('/api/discussions/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        return data.data?.repository?.discussionCategories?.nodes || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

async function createDiscussion(categoryId, title, body) {
    const requestData = { categoryId, title, body };

    console.log('=== FRONTEND: Creating Discussion ===');
    console.log('Category ID:', categoryId);
    console.log('Title:', title);
    console.log('Body:', body);
    console.log('Request payload:', requestData);
    console.log('====================================');

    const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });

    console.log('Response status:', response.status);

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
        // Check if error response
        if (data.error) {
            throw new Error(data.error);
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return data;
}

async function addComment(discussionId, body) {
    const response = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body })
    });

    const data = await response.json();

    if (!response.ok) {
        // Check if error response
        if (data.error) {
            throw new Error(data.error);
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return data;
}

// ============================================
// Rendering Functions
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

function renderDiscussions() {
    const container = document.getElementById('discussionsContainer');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');

    const filteredDiscussions = getFilteredDiscussions();

    if (filteredDiscussions.length === 0) {
        container.innerHTML = '';
        loadingState.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    loadingState.style.display = 'none';
    emptyState.style.display = 'none';

    container.innerHTML = filteredDiscussions.map(discussion => `
        <div class="col-12 mb-3">
            <div class="card discussion-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="flex-grow-1">
                            <h5 class="card-title mb-1">
                                <a href="${discussion.url}" target="_blank" class="text-decoration-none">
                                    ${escapeHtml(discussion.title)}
                                </a>
                            </h5>
                            <div class="d-flex align-items-center gap-2 mb-2">
                                ${discussion.author && discussion.author.avatarUrl ?
                                    `<img src="${discussion.author.avatarUrl}" class="avatar" alt="${escapeHtml(discussion.author.login)}">` :
                                    '<i class="bi bi-person-circle"></i>'}
                                <small class="text-muted">
                                    ${discussion.author ? escapeHtml(discussion.author.login) : 'Unknown'}
                                    • ${formatDate(discussion.createdAt)}
                                </small>
                                ${discussion.category ?
                                    `<span class="badge badge-category bg-secondary">${escapeHtml(discussion.category.name)}</span>` :
                                    ''}
                            </div>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-light text-dark">
                                <i class="bi bi-chat-dots me-1"></i>
                                ${discussion.comments?.totalCount || 0}
                            </span>
                        </div>
                    </div>
                    <p class="card-text text-secondary">
                        ${discussion.body ? truncateText(escapeHtml(discussion.body), 200) : 'No description'}
                    </p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewDiscussion('${discussion.id}', '${escapeHtml(discussion.title)}')">
                            <i class="bi bi-eye me-1"></i> View Details
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="openAddCommentModal('${discussion.id}')">
                            <i class="bi bi-plus-circle me-1"></i> Add Comment
                        </button>
                        <a href="${discussion.url}" target="_blank" class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-box-arrow-up-right me-1"></i> Open on GitHub
                        </a>
                    </div>

                    ${discussion.comments && discussion.comments.nodes && discussion.comments.nodes.length > 0 ? `
                        <div class="mt-3">
                            <h6 class="mb-2">Recent Comments:</h6>
                            ${discussion.comments.nodes.slice(0, 3).map(comment => `
                                <div class="comment-item mb-2 pb-2">
                                    <div class="d-flex align-items-center gap-2 mb-1">
                                        ${comment.author && comment.author.avatarUrl ?
                                            `<img src="${comment.author.avatarUrl}" class="avatar" alt="${escapeHtml(comment.author.login)}">` :
                                            '<i class="bi bi-person-circle"></i>'}
                                        <small class="text-muted">
                                            <strong>${comment.author ? escapeHtml(comment.author.login) : 'Unknown'}</strong>
                                            • ${formatDate(comment.createdAt)}
                                        </small>
                                    </div>
                                    <p class="mb-0 small">${truncateText(escapeHtml(comment.body), 150)}</p>
                                </div>
                            `).join('')}
                            ${discussion.comments.totalCount > 3 ?
                                `<small class="text-muted">+ ${discussion.comments.totalCount - 3} more comments</small>` :
                                ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const discussionCategory = document.getElementById('discussionCategory');

    const options = state.categories.map(cat =>
        `<option value="${cat.id}">${escapeHtml(cat.name)}${cat.description ? ' - ' + escapeHtml(cat.description) : ''}</option>`
    ).join('');

    categoryFilter.innerHTML = '<option value="">All Categories</option>' + options;
    discussionCategory.innerHTML = '<option value="">Select a category...</option>' + options;
}

// ============================================
// Filtering and Sorting
// ============================================

function getFilteredDiscussions() {
    let filtered = [...state.discussions];

    // Apply search filter
    if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(d =>
            d.title.toLowerCase().includes(searchLower) ||
            (d.body && d.body.toLowerCase().includes(searchLower)) ||
            (d.author && d.author.login.toLowerCase().includes(searchLower))
        );
    }

    // Apply category filter
    if (state.filters.category) {
        filtered = filtered.filter(d =>
            d.category && d.category.name === state.filters.category
        );
    }

    // Apply sorting
    filtered.sort((a, b) => {
        switch (state.filters.sortBy) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    return filtered;
}

function updateFilters() {
    state.filters.search = document.getElementById('searchInput').value;
    state.filters.category = getCategoryNameById(document.getElementById('categoryFilter').value);
    state.filters.sortBy = document.getElementById('sortBy').value;
    renderDiscussions();

    // Track filter usage
    trackEvent('discussions_filtered', {
        has_search: state.filters.search.length > 0,
        category: state.filters.category || 'all',
        sort_by: state.filters.sortBy
    });
}

function getCategoryNameById(categoryId) {
    if (!categoryId) return '';
    const category = state.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortBy').value = 'newest';
    state.filters = {
        search: '',
        category: '',
        sortBy: 'newest'
    };
    renderDiscussions();

    // Track filter clearing
    trackEvent('discussions_filters_cleared');
}

// ============================================
// Modal Functions
// ============================================

function openAddCommentModal(discussionId) {
    state.selectedDiscussionId = discussionId;
    const modal = new bootstrap.Modal(document.getElementById('addCommentModal'));
    document.getElementById('commentBody').value = '';
    modal.show();

    // Track comment modal opened
    trackEvent('add_comment_modal_opened', {
        discussion_id: discussionId
    });
}

function viewDiscussion(discussionId, title) {
    const discussion = state.discussions.find(d => d.id === discussionId);
    if (discussion) {
        // Track discussion view
        trackEvent('discussion_viewed', {
            discussion_id: discussionId,
            discussion_title: title,
            discussion_number: discussion.number,
            comment_count: discussion.comments?.totalCount || 0
        });

        window.open(discussion.url, '_blank');
    }
}

// ============================================
// Event Handlers
// ============================================

async function handleNewDiscussion() {
    const form = document.getElementById('newDiscussionForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const categoryId = document.getElementById('discussionCategory').value;
    const title = document.getElementById('discussionTitle').value;
    const body = document.getElementById('discussionBody').value;

    const submitBtn = document.getElementById('btnSubmitDiscussion');
    const spinner = submitBtn.querySelector('.spinner-border');
    const submitText = submitBtn.querySelector('.submit-text');

    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    submitText.textContent = 'Creating...';

    try {
        const result = await createDiscussion(categoryId, title, body);

        if (result && result.data && result.data.createDiscussion) {
            // Track successful discussion creation
            trackEvent('discussion_created', {
                discussion_title: title,
                discussion_url: result.data.createDiscussion.discussion.url,
                category_id: categoryId,
                body_length: body.length
            });

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('newDiscussionModal'));
            modal.hide();

            // Reset form
            form.reset();

            // Reload discussions
            await loadData();

            // Show success message
            alert('Discussion created successfully! View it on GitHub: ' + result.data.createDiscussion.discussion.url);
        } else {
            console.error('Unexpected response:', result);
            alert('Discussion may not have been created properly. Check the console and server logs.');
        }
    } catch (error) {
        console.error('Error creating discussion:', error);
        let errorMessage = 'Failed to create discussion. ';
        if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Please check your GitHub token permissions (needs write:discussion scope) and ensure Discussions are enabled on your repository.';
        }
        alert(errorMessage);
    } finally {
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        submitText.textContent = 'Create Discussion';
    }
}

async function handleAddComment() {
    const form = document.getElementById('addCommentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const body = document.getElementById('commentBody').value;
    const discussionId = state.selectedDiscussionId;

    const submitBtn = document.getElementById('btnSubmitComment');
    const spinner = submitBtn.querySelector('.spinner-border');
    const submitText = submitBtn.querySelector('.submit-text');

    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    submitText.textContent = 'Adding...';

    try {
        const result = await addComment(discussionId, body);

        if (result && result.data && result.data.addDiscussionComment) {
            // Track successful comment addition
            trackEvent('comment_added', {
                discussion_id: discussionId,
                comment_length: body.length
            });

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCommentModal'));
            modal.hide();

            // Reset form
            form.reset();

            // Reload discussions
            await loadData();

            // Show success message
            alert('Comment added successfully!');
        } else {
            console.error('Unexpected response:', result);
            alert('Comment may not have been added properly. Check the console and server logs.');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        let errorMessage = 'Failed to add comment. ';
        if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Please check your GitHub token permissions.';
        }
        alert(errorMessage);
    } finally {
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        submitText.textContent = 'Add Comment';
    }
}

// ============================================
// Utility Functions
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// Consent Banner Management
// ============================================

function initConsentBanner() {
    const banner = document.getElementById('consentBanner');
    const consent = localStorage.getItem('analytics_consent');

    // Show banner if consent not set
    if (!consent) {
        banner.style.display = 'block';
    }

    // Accept analytics
    document.getElementById('btnAcceptAnalytics').addEventListener('click', () => {
        localStorage.setItem('analytics_consent', 'granted');
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        banner.style.display = 'none';
        trackEvent('consent_granted', {
            page: 'discussions',
            timestamp: new Date().toISOString()
        });
    });

    // Decline analytics
    document.getElementById('btnDeclineAnalytics').addEventListener('click', () => {
        localStorage.setItem('analytics_consent', 'denied');
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        banner.style.display = 'none';
    });
}

// ============================================
// Initialization
// ============================================

async function loadData() {
    const loadingState = document.getElementById('loadingState');
    loadingState.style.display = 'block';

    // Load discussions and categories in parallel
    const [discussions, categories] = await Promise.all([
        fetchDiscussions(),
        fetchCategories()
    ]);

    state.discussions = discussions;
    state.categories = categories;

    renderCategoryFilter();
    renderDiscussions();

    // Track discussions loaded
    trackEvent('discussions_loaded', {
        discussion_count: discussions.length,
        category_count: categories.length
    });
}

function attachEventListeners() {
    // Filter inputs
    document.getElementById('searchInput').addEventListener('input', updateFilters);
    document.getElementById('categoryFilter').addEventListener('change', updateFilters);
    document.getElementById('sortBy').addEventListener('change', updateFilters);
    document.getElementById('btnClearFilters').addEventListener('click', clearFilters);

    // New discussion button
    document.getElementById('btnNewDiscussion').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('newDiscussionModal'));
        modal.show();
        trackEvent('new_discussion_modal_opened');
    });

    // Submit buttons
    document.getElementById('btnSubmitDiscussion').addEventListener('click', handleNewDiscussion);
    document.getElementById('btnSubmitComment').addEventListener('click', handleAddComment);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    attachEventListeners();
    initConsentBanner();
    loadData();

    // Track page view
    trackEvent('page_view', {
        page_title: document.title,
        page_path: window.location.pathname,
        page_location: window.location.href
    });
});
