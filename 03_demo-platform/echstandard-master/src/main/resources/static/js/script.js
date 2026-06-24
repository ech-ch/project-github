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

/**
 * Get all sections recursively (including subsections)
 */
function getAllSections(sections) {
    const result = [];
    sections.forEach(section => {
        result.push(section);
        if (section.subsections && section.subsections.length > 0) {
            result.push(...getAllSections(section.subsections));
        }
    });
    return result;
}

/**
 * Get current document composition as a string
 * @returns {string} - Combination string like "intro-v2|scope-v3|data-v1"
 */
function getCurrentCombination() {
    const {document: doc, selected} = state;
    const allSections = getAllSections(doc.sections);
    return allSections
        .map(section => {
            const versionId = selected[section.id];
            if (!versionId) return null;
            const version = getVersionById(section, versionId);
            return version ? `${section.id}-${version.label}` : null;
        })
        .filter(Boolean)
        .join('|');
}

/**
 * Get detailed combination data for analytics
 * @returns {Object} - Object with section-version mappings
 */
function getCombinationDetails() {
    const {document: doc, selected} = state;
    const allSections = getAllSections(doc.sections);
    const details = {};
    allSections.forEach(section => {
        const versionId = selected[section.id];
        if (versionId) {
            const version = getVersionById(section, versionId);
            if (version) {
                details[section.id] = {
                    version_label: version.label,
                    version_id: version.id,
                    version_date: version.date
                };
            }
        }
    });
    return details;
}

// ============================================
// Sample Document Data
// ============================================

const sampleDocument = {
    title: "Reader-Friendly Policy Document",
    sections: [
        {
            id: "intro",
            title: "1. Introduction",
            versions: [
                {
                    id: "intro-v1",
                    label: "v1",
                    date: "2024-03-01",
                    notes: "Initial draft",
                    content: `<p>Welcome to our policy. This document explains how we handle data and services.</p>`
                },
                {
                    id: "intro-v2",
                    label: "v2",
                    date: "2025-01-15",
                    notes: "Clarified scope",
                    content: `<p>Welcome. This policy outlines our data handling practices and service commitments in clear terms.</p>`
                }
            ]
        },
        {
            id: "scope",
            title: "2. Scope",
            versions: [
                {
                    id: "scope-v1",
                    label: "v1",
                    date: "2024-02-10",
                    notes: "Covers core products",
                    content: `<p>This policy applies to our core web applications.</p>`
                },
                {
                    id: "scope-v2",
                    label: "v2",
                    date: "2024-11-20",
                    notes: "Adds mobile apps",
                    content: `<p>This policy applies to our web applications and mobile apps.</p>`
                },
                {
                    id: "scope-v3",
                    label: "v3",
                    date: "2025-05-09",
                    notes: "Includes third-party integrations",
                    content: `<p>This policy applies to our web applications, mobile apps, and approved third-party integrations.</p>`
                }
            ]
        },
        {
            id: "data",
            title: "3. Data Collection",
            versions: [
                {
                    id: "data-v1",
                    label: "v1",
                    date: "2023-12-05",
                    notes: "Basic telemetry",
                    content: `<p>We collect basic telemetry such as page views to improve performance.</p>`
                },
                {
                    id: "data-v2",
                    label: "v2",
                    date: "2024-08-18",
                    notes: "Adds error reports",
                    content: `<p>We collect telemetry and error reports to enhance reliability and support.</p>`
                },
                {
                    id: "data-v3",
                    label: "v3",
                    date: "2025-06-30",
                    notes: "Granular controls",
                    content: `<p>We collect telemetry and error reports with granular user controls and opt-outs.</p>`
                }
            ]
        },
        {
            id: "security",
            title: "4. Security Measures",
            versions: [
                {
                    id: "sec-v1",
                    label: "v1",
                    date: "2024-04-02",
                    notes: "Baseline controls",
                    content: `<ul><li>Encryption in transit</li><li>Regular backups</li></ul>`
                },
                {
                    id: "sec-v2",
                    label: "v2",
                    date: "2025-02-22",
                    notes: "Adds auditing",
                    content: `<ul><li>Encryption in transit & at rest</li><li>Regular backups</li><li>Security auditing</li></ul>`
                }
            ]
        },
        {
            id: "contact",
            title: "5. Contact",
            versions: [
                {
                    id: "contact-v1",
                    label: "v1",
                    date: "2024-06-01",
                    notes: "Standard",
                    content: `<p>Contact us at support@example.com.</p>`
                },
                {
                    id: "contact-v2",
                    label: "v2",
                    date: "2025-03-12",
                    notes: "Adds help center",
                    content: `<p>Contact us at support@example.com or visit our Help Center for FAQs.</p>`
                }
            ]
        }
    ]
};

let state = {document: structuredClone(sampleDocument), selected: {}, expanded: {}, expandedGroups: {}};

function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
}

function fmtDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: '2-digit'});
}

function latestVersion(versions) {
    if (!versions || versions.length === 0) return null;
    return versions[versions.length - 1];
}

function getVersionById(section, versionId) {
    return section.versions.find(v => v.id === versionId) || null;
}

function updateTimestamp() {
    const now = new Date();
    document.getElementById('updatedAt').textContent = `Updated ${now.toLocaleTimeString()}`;
}

function renderControls() {
    const {document: doc} = state;
    const c = document.getElementById('sectionsContainer');
    c.innerHTML = '';
    document.getElementById('docTitleInput').value = doc.title || '';

    // Group sections by directory
    const groupedSections = groupSectionsByDirectory(doc.sections);

    // Render each group
    Object.entries(groupedSections).forEach(([dirName, sections]) => {
        renderDirectoryGroup(dirName, sections, c);
    });
}

function groupSectionsByDirectory(sections) {
    const groups = {};
    sections.forEach(section => {
        const dirName = section.directory || 'Other';
        if (!groups[dirName]) {
            groups[dirName] = [];
        }
        groups[dirName].push(section);
    });
    return groups;
}

function renderDirectoryGroup(dirName, sections, container) {
    // Create a collapsible group header
    const groupId = `group-${dirName.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const isExpanded = state.expandedGroups?.[dirName] !== false; // Default expanded

    const groupHeader = el(`<div class='directory-group mb-3'>
        <div class='d-flex align-items-center mb-2'>
            <button class='btn btn-link btn-sm p-0 text-decoration-none fw-bold group-toggle' data-group='${dirName}' style='color: #495057;'>
                <span class='expand-icon'>${isExpanded ? '▼' : '▶'}</span> ${dirName}
            </button>
        </div>
        <div class='group-sections' id='${groupId}' style='display: ${isExpanded ? 'block' : 'none'};'></div>
    </div>`);

    const toggleBtn = groupHeader.querySelector('.group-toggle');
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!state.expandedGroups) {
            state.expandedGroups = {};
        }
        state.expandedGroups[dirName] = !isExpanded;
        renderControls();
    });

    container.appendChild(groupHeader);

    const sectionsContainer = groupHeader.querySelector('.group-sections');
    sections.forEach(section => {
        renderSection(section, sectionsContainer, 0);
    });
}

function renderSection(section, container, level) {
    // Skip sections without versions
    if (!section.versions || section.versions.length === 0) {
        if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach(sub => renderSection(sub, container, level));
        }
        return;
    }

    const vLatest = latestVersion(section.versions);
    const selectedId = state.selected[section.id] || '';
    const selectedVersion = selectedId ? getVersionById(section, selectedId) : null;
    const displayNotes = selectedVersion ? selectedVersion.notes : vLatest.notes;
    const hasSubsections = section.subsections && section.subsections.length > 0;
    const isExpanded = state.expanded[section.id] !== false; // Default expanded

    // Calculate indentation
    const indentPx = level * 20;
    const expandIcon = hasSubsections ? (isExpanded ? '▼' : '▶') : '';
    const expandBtn = hasSubsections ? `<button class='btn btn-link btn-sm p-0 expand-toggle' data-section='${section.id}' style='font-size: 0.9rem; color: #6c757d; text-decoration: none;'>${expandIcon}</button>` : '';

    const block = el(`<div class='section-item mb-2' style='margin-left: ${indentPx}px;'>
        <div class='border rounded p-3 bg-white'>
            <div class='d-flex justify-content-between align-items-start mb-2'>
                <div>
                    <div class='fw-semibold'>${section.title}</div>
                    <div class='text-muted small'>Choose a version below</div>
                </div>
                <div class='d-flex align-items-center gap-2'>
                    <span class='badge text-bg-light version-badge'>Latest: ${vLatest.label} · ${fmtDate(vLatest.date)}</span>
                    ${expandBtn}
                </div>
            </div>
            <div class='row g-2 align-items-center'>
                <div class='col-12 col-md-7'>
                    <select class='form-select form-select-sm' data-section='${section.id}'>
                        <option value='' ${selectedId === '' ? 'selected' : ''}>(none)</option>
                        ${section.versions.map(v => `<option value='${v.id}' ${selectedId === v.id ? 'selected' : ''}>${v.label} — ${fmtDate(v.date)}</option>`).join('')}
                    </select>
                </div>
                <div class='col-12 col-md-5'>
                    <div class='form-text text-truncate' title='${displayNotes || ''}'>Notes: ${displayNotes || '—'}</div>
                </div>
            </div>
        </div>
    </div>`);

    const select = block.querySelector('select');
    select.addEventListener('change', e => {
        const vId = e.target.value;
        if (vId) {
            state.selected[section.id] = vId;
            const version = getVersionById(section, vId);
            trackEvent('version_selected', {
                section_id: section.id,
                section_title: section.title,
                version_id: version.id,
                version_label: version.label,
                version_date: version.date,
                current_combination: getCurrentCombination()
            });
        } else {
            delete state.selected[section.id];
            trackEvent('version_deselected', {
                section_id: section.id,
                section_title: section.title
            });
        }
        renderControls();
        renderPreview();
    });

    // Add expand/collapse handler
    if (hasSubsections) {
        const toggleBtn = block.querySelector('.expand-toggle');
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            state.expanded[section.id] = !isExpanded;
            renderControls();
        });
    }

    container.appendChild(block);

    // Render subsections if expanded
    if (hasSubsections && isExpanded && section.subsections) {
        section.subsections.forEach(sub => renderSection(sub, container, level + 1));
    }
}

function cleanAndParseMarkdown(markdown) {
    if (!markdown) return '';

    // Clean up escaped characters and formatting issues
    let cleaned = markdown
        // Replace escaped special characters (order matters!)
        .replace(/\\'96/g, '–')                  // \'96 -> en-dash
        .replace(/\\'e4/g, 'ä')                  // \'e4 -> ä
        .replace(/\\'f6/g, 'ö')                  // \'f6 -> ö
        .replace(/\\'fc/g, 'ü')                  // \'fc -> ü
        .replace(/\\'c4/g, 'Ä')                  // \'c4 -> Ä
        .replace(/\\'d6/g, 'Ö')                  // \'d6 -> Ö
        .replace(/\\'dc/g, 'Ü')                  // \'dc -> Ü
        .replace(/\\'df/g, 'ß')                  // \'df -> ß
        .replace(/\\'e9/g, 'é')                  // \'e9 -> é
        .replace(/\\'e8/g, 'è')                  // \'e8 -> è
        .replace(/\\'e0/g, 'à')                  // \'e0 -> à
        // Now handle generic escapes
        .replace(/\\'/g, "'")                    // \' -> '
        .replace(/\\"/g, '"')                    // \" -> "
        // Remove trailing backslashes at end of lines
        .replace(/\s*\\$/gm, '')
        // Remove backslashes before spaces (\ )
        .replace(/\\ /g, ' ')
        // Clean up the backslash+newline pattern
        .replace(/\\\n/g, '\n')
        // Clean up multiple spaces (but not at line start for code blocks)
        .replace(/([^\n]) {2,}/g, '$1 ')
        // Fix any remaining problematic backslashes
        .replace(/\\(?=[^\w\s`*_\[\]()#])/g, '');

    // Parse markdown to HTML using marked.js
    try {
        if (typeof marked !== 'undefined') {
            // Configure marked for proper GitHub-flavored markdown
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: false,
                mangle: false,
                pedantic: false,
                smartLists: true,
                smartypants: false
            });
            return marked.parse(cleaned);
        } else {
            return cleaned;
        }
    } catch (e) {
        console.error('Error parsing markdown:', e);
        return cleaned;
    }
}

function renderPreview() {
    const preview = document.getElementById('previewArea');
    const {document: doc, selected} = state;
    const hTitle = document.getElementById('docTitleInput').value.trim() || 'Untitled Document';
    document.getElementById('printDocTitle').textContent = hTitle;
    const htmlParts = [`<h1 class='doc-title h3'>${hTitle}</h1>`];

    const allSections = getAllSections(doc.sections);
    allSections.forEach(section => {
        const chosenId = selected[section.id];
        if (!chosenId) return;
        const version = getVersionById(section, chosenId);
        if (!version) return;
        htmlParts.push(`<h2 class='h5 mt-4'>${section.title} <span class='badge text-bg-secondary ms-2'>${version.label}</span></h2>`);
        htmlParts.push(`<div class='mb-2 small text-muted'>Version date: ${fmtDate(version.date)}</div>`);

        // Parse and render the markdown content
        const parsedContent = cleanAndParseMarkdown(version.content);
        htmlParts.push(`<div class='section-content'>${parsedContent}</div>`);
    });
    if (htmlParts.length === 1) {
        htmlParts.push(`<div class='text-muted'>No sections selected yet. Choose versions on the left to build your document.</div>`);
    }
    preview.innerHTML = htmlParts.join('\n');
    updateTimestamp();
}

function attachEvents() {
    document.getElementById('btnUseLatest').addEventListener('click', () => {
        const allSections = getAllSections(state.document.sections);
        allSections.forEach(sec => {
            if (sec.versions && sec.versions.length > 0) {
                const v = latestVersion(sec.versions);
                state.selected[sec.id] = v.id;
            }
        });
        renderControls();
        renderPreview();

        // Track "Use Latest" action
        trackEvent('use_latest_versions', {
            combination: getCurrentCombination(),
            section_count: allSections.length
        });
    });
    document.getElementById('btnClear').addEventListener('click', () => {
        const previousCombination = getCurrentCombination();
        state.selected = {};
        renderControls();
        renderPreview();

        // Track clear action
        trackEvent('clear_selections', {
            previous_combination: previousCombination
        });
    });
    document.getElementById('btnGenerate').addEventListener('click', () => {
        renderPreview();

        // Track document generation with full combination details
        const combination = getCurrentCombination();
        const details = getCombinationDetails();
        trackEvent('document_generated', {
            combination: combination,
            section_count: Object.keys(state.selected).length,
            total_sections: state.document.sections.length,
            combination_details: JSON.stringify(details)
        });
    });
    document.getElementById('btnCopy').addEventListener('click', async () => {
        const temp = document.createElement('div');
        temp.innerHTML = document.getElementById('previewArea').innerHTML;
        const text = temp.textContent || temp.innerText || '';
        await navigator.clipboard.writeText(text);

        // Track copy action with combination
        const combination = getCurrentCombination();
        const details = getCombinationDetails();
        trackEvent('document_copied', {
            combination: combination,
            section_count: Object.keys(state.selected).length,
            combination_details: JSON.stringify(details)
        });
    });
    document.getElementById('btnDownloadHtml').addEventListener('click', () => {
        const content = document.getElementById('previewArea').innerHTML;
        const title = document.getElementById('docTitleInput').value.trim() || 'document';
        const blob = new Blob([content], {type: 'text/html'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.html`;
        a.click();

        // Track download action with combination - THIS IS KEY DATA
        const combination = getCurrentCombination();
        const details = getCombinationDetails();
        trackEvent('document_downloaded', {
            combination: combination,
            section_count: Object.keys(state.selected).length,
            document_title: title,
            combination_details: JSON.stringify(details),
            format: 'html'
        });
    });
    document.getElementById('btnPrint').addEventListener('click', () => {
        window.print();

        // Track print action with combination - THIS IS KEY DATA
        const combination = getCurrentCombination();
        const details = getCombinationDetails();
        trackEvent('document_printed', {
            combination: combination,
            section_count: Object.keys(state.selected).length,
            combination_details: JSON.stringify(details)
        });
    });
    document.getElementById('docTitleInput').addEventListener('input', () => {
        renderPreview();
    });
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
        trackEvent('consent_granted', { timestamp: new Date().toISOString() });
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

async function loadDocumentFromBackend() {
    try {
        const response = await fetch('/api/documents');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const document = await response.json();

        // If the backend returns an empty document, use the sample data as fallback
        if (!document.sections || document.sections.length === 0) {
            console.warn('Backend returned empty document, using sample data');
            return structuredClone(sampleDocument);
        }

        return document;
    } catch (error) {
        console.error('Failed to load document from backend:', error);
        console.warn('Using sample data as fallback');
        return structuredClone(sampleDocument);
    }
}

async function init() {
    // Load document from backend
    state.document = await loadDocumentFromBackend();

    // Auto-select latest versions for all sections (including subsections)
    const allSections = getAllSections(state.document.sections);
    allSections.forEach(sec => {
        if (sec.versions && sec.versions.length > 0) {
            state.selected[sec.id] = latestVersion(sec.versions).id;
        }
    });

    renderControls();
    renderPreview();
    attachEvents();
    initConsentBanner();

    // Track page view
    trackEvent('page_view', {
        page_title: document.title,
        page_path: window.location.pathname
    });
}

document.addEventListener('DOMContentLoaded', init);