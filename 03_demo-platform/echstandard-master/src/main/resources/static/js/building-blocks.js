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
 * Get all sections (no subsections in building blocks)
 */
function getAllSections(sections) {
    return sections;
}

/**
 * Get current document composition as a string
 * @returns {string} - Combination string like "bb1-v2|bb2-v3|bb3-v1"
 */
function getCurrentCombination() {
    const {document: doc, selected} = state;
    return doc.sections
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
    const details = {};
    doc.sections.forEach(section => {
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
// State Management
// ============================================

const sampleDocument = {
    title: "Building Blocks",
    sections: []
};

let state = {
    document: structuredClone(sampleDocument),
    selected: {},
    selectedBlocks: [], // Array of block IDs in order
    viewMode: 'markdown', // 'markdown' or 'json'
    selectedAttributeVersions: {} // Map of blockId -> Map of attributeName -> selectedVersionId (or null for none)
};

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

function addBlock(blockId) {
    // Check if already added
    if (state.selectedBlocks.includes(blockId)) {
        return;
    }

    // Add to selected blocks
    state.selectedBlocks.push(blockId);

    // Auto-select latest version
    const section = state.document.sections.find(s => s.id === blockId);
    if (section && section.versions && section.versions.length > 0) {
        const v = latestVersion(section.versions);
        state.selected[section.id] = v.id;
    }

    renderControls();
    renderPreview();

    trackEvent('bb_block_added', {
        block_id: blockId,
        block_count: state.selectedBlocks.length
    });
}

function renderControls() {
    const {document: doc, selectedBlocks} = state;
    const c = document.getElementById('sectionsContainer');
    c.innerHTML = '';
    document.getElementById('docTitleInput').value = doc.title || '';

    // Render only selected blocks in order
    selectedBlocks.forEach(blockId => {
        const section = doc.sections.find(s => s.id === blockId);
        if (section) {
            renderSection(section, c);
        }
    });
}

function renderSection(section, container) {
    // Skip sections without versions
    if (!section.versions || section.versions.length === 0) {
        return;
    }

    const vLatest = latestVersion(section.versions);
    const selectedId = state.selected[section.id] || '';
    const selectedVersion = selectedId ? getVersionById(section, selectedId) : null;
    const displayNotes = selectedVersion ? selectedVersion.notes : vLatest.notes;

    // Check if this section has attributes available
    const hasAttributes = section.attributes && section.attributes.length > 0;

    const block = el(`<div class='section-item mb-2'>
        <div class='border rounded p-3 bg-white'>
            <div class='d-flex justify-content-between align-items-start mb-2'>
                <div>
                    <div class='fw-semibold'>${section.title}</div>
                    <div class='text-muted small'>Choose a version below</div>
                </div>
                <div class='d-flex align-items-center gap-2'>
                    <span class='badge text-bg-light version-badge'>Latest: ${vLatest.label} · ${fmtDate(vLatest.date)}</span>
                    <button class='btn btn-sm btn-outline-primary' data-discuss='${section.id}' title='Create Discussion'>
                        <i class='bi bi-chat-square-text'></i>
                    </button>
                    <button class='btn btn-sm btn-outline-danger' data-remove='${section.id}' title='Remove'>
                        <i class='bi bi-trash'></i>
                    </button>
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
            <div class='attributes-container' data-block='${section.id}' style='display: ${hasAttributes ? 'block' : 'none'};'></div>
        </div>
    </div>`);

    const select = block.querySelector('select');
    select.addEventListener('change', e => {
        const vId = e.target.value;
        if (vId) {
            state.selected[section.id] = vId;
            const version = getVersionById(section, vId);
            trackEvent('bb_version_selected', {
                section_id: section.id,
                section_title: section.title,
                version_id: version.id,
                version_label: version.label,
                version_date: version.date,
                current_combination: getCurrentCombination()
            });

            // Render attributes if available
            renderAttributes(section, version, block.querySelector('.attributes-container'));
        } else {
            delete state.selected[section.id];
            trackEvent('bb_version_deselected', {
                section_id: section.id,
                section_title: section.title
            });
            // Hide attributes
            block.querySelector('.attributes-container').style.display = 'none';
        }
        renderPreview();
    });

    const discussBtn = block.querySelector('[data-discuss]');
    discussBtn.addEventListener('click', () => {
        openDiscussionModal(section.id, section.title);
    });

    const removeBtn = block.querySelector('[data-remove]');
    removeBtn.addEventListener('click', () => {
        trackEvent('bb_block_removed', {
            block_id: section.id,
            block_title: section.title,
            block_count: state.selectedBlocks.length - 1
        });
        // Remove from selectedBlocks
        state.selectedBlocks = state.selectedBlocks.filter(id => id !== section.id);
        // Remove from selected versions
        delete state.selected[section.id];
        // Remove selected attribute versions
        delete state.selectedAttributeVersions[section.id];
        renderControls();
        renderPreview();
    });

    // Render attributes if a version is already selected
    if (hasAttributes && selectedVersion) {
        renderAttributes(section, selectedVersion, block.querySelector('.attributes-container'));
    }

    container.appendChild(block);
}

function renderAttributes(section, version, container) {
    const blockId = section.id;
    console.log('renderAttributes called for block:', blockId);
    console.log('section.attributes:', section.attributes);
    console.log('version.attributeReferences:', version.attributeReferences);

    if (!section.attributes || section.attributes.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    // Initialize selectedAttributeVersions for this block if not exists
    if (!state.selectedAttributeVersions[blockId]) {
        state.selectedAttributeVersions[blockId] = new Map();

        // Initialize with the attributeReferences from the version (or latest by default)
        if (version.attributeReferences && version.attributeReferences.length > 0) {
            version.attributeReferences.forEach(ref => {
                state.selectedAttributeVersions[blockId].set(ref.attributeName, ref.selectedVersionId);
            });
        } else {
            // Default: select latest version of each attribute
            section.attributes.forEach(attr => {
                if (attr.versions && attr.versions.length > 0) {
                    const latestVer = attr.versions[attr.versions.length - 1];
                    state.selectedAttributeVersions[blockId].set(attr.name, latestVer.id);
                }
            });
        }
    }

    const html = `
        <div class='mt-3 pt-3 border-top'>
            <div class='d-flex justify-content-between align-items-center mb-2'>
                <div class='small fw-semibold'>Attribute Versions</div>
                <div class='btn-group btn-group-sm'>
                    <button class='btn btn-outline-secondary' data-select-latest='${blockId}'>Use Latest</button>
                    <button class='btn btn-outline-secondary' data-clear-all='${blockId}'>Clear All</button>
                </div>
            </div>
            <div class='vstack gap-2'>
                ${section.attributes.map(attr => {
                    const selectedVersionId = state.selectedAttributeVersions[blockId].get(attr.name) || '';
                    return `
                        <div class='d-flex align-items-center gap-2'>
                            <label class='small mb-0' style='min-width: 120px;'>${attr.name}</label>
                            <select class='form-select form-select-sm' data-block='${blockId}' data-attr='${attr.name}'>
                                <option value='' ${selectedVersionId === '' ? 'selected' : ''}>(none)</option>
                                ${attr.versions.map(v => `<option value='${v.id}' ${selectedVersionId === v.id ? 'selected' : ''}>${v.version} — ${fmtDate(v.date)}</option>`).join('')}
                            </select>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Add event listeners for attribute version selects
    container.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', e => {
            const attrName = e.target.dataset.attr;
            const versionId = e.target.value;

            // Find the attribute and version details for tracking
            const attribute = section.attributes.find(a => a.name === attrName);
            const version = versionId ? attribute?.versions.find(v => v.id === versionId) : null;

            if (versionId) {
                state.selectedAttributeVersions[blockId].set(attrName, versionId);
                trackEvent('bb_attribute_version_selected', {
                    block_id: blockId,
                    block_title: section.title,
                    attribute_name: attrName,
                    version_id: versionId,
                    version_label: version?.version,
                    version_date: version?.date,
                    current_combination: getCurrentCombination()
                });
            } else {
                state.selectedAttributeVersions[blockId].set(attrName, null);
                trackEvent('bb_attribute_version_deselected', {
                    block_id: blockId,
                    block_title: section.title,
                    attribute_name: attrName
                });
            }
            renderPreview();
        });
    });

    // Add event listener for "Use Latest" button
    container.querySelector(`[data-select-latest="${blockId}"]`)?.addEventListener('click', () => {
        const selectedAttributes = [];
        section.attributes.forEach(attr => {
            if (attr.versions && attr.versions.length > 0) {
                const latestVer = attr.versions[attr.versions.length - 1];
                state.selectedAttributeVersions[blockId].set(attr.name, latestVer.id);
                selectedAttributes.push({
                    name: attr.name,
                    version: latestVer.version,
                    version_id: latestVer.id
                });
            }
        });
        trackEvent('bb_attributes_use_latest', {
            block_id: blockId,
            block_title: section.title,
            attribute_count: selectedAttributes.length,
            attributes: JSON.stringify(selectedAttributes)
        });
        renderControls();
        renderPreview();
    });

    // Add event listener for "Clear All" button
    container.querySelector(`[data-clear-all="${blockId}"]`)?.addEventListener('click', () => {
        const clearedAttributes = [];
        section.attributes.forEach(attr => {
            clearedAttributes.push(attr.name);
            state.selectedAttributeVersions[blockId].set(attr.name, null);
        });
        trackEvent('bb_attributes_clear_all', {
            block_id: blockId,
            block_title: section.title,
            attribute_count: clearedAttributes.length,
            attributes: JSON.stringify(clearedAttributes)
        });
        renderControls();
        renderPreview();
    });
}

function renderPreview() {
    const preview = document.getElementById('previewArea');
    const {document: doc, selected, selectedBlocks, viewMode} = state;
    const hTitle = document.getElementById('docTitleInput').value.trim() || 'Untitled Document';
    document.getElementById('printDocTitle').textContent = hTitle;

    if (viewMode === 'json') {
        renderJsonPreview(preview, doc, selected, selectedBlocks, hTitle);
    } else {
        renderMarkdownPreview(preview, doc, selected, selectedBlocks, hTitle);
    }

    updateTimestamp();
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
        // Remove trailing backslashes at end of lines (but preserve markdown line breaks)
        .replace(/\s*\\$/gm, '')
        // Remove backslashes before spaces (\ )
        .replace(/\\ /g, ' ')
        // Clean up the backslash+newline pattern
        .replace(/\\\n/g, '\n')
        // Clean up multiple spaces (but not at line start for code blocks)
        .replace(/([^\n]) {2,}/g, '$1 ')
        // Fix any remaining problematic backslashes (but not in code)
        .replace(/\\(?=[^\w\s`*_\[\]()#])/g, '');

    // Parse markdown to HTML using marked.js
    try {
        if (typeof marked !== 'undefined') {
            // Configure marked for proper GitHub-flavored markdown
            marked.setOptions({
                breaks: true,           // Convert \n to <br>
                gfm: true,             // GitHub Flavored Markdown
                headerIds: false,       // Don't add IDs to headers
                mangle: false,         // Don't escape emails
                pedantic: false,       // Don't be pedantic
                smartLists: true,      // Better list handling
                smartypants: false     // Don't convert quotes/dashes
            });

            const html = marked.parse(cleaned);
            console.log('Parsed markdown to HTML:', html.substring(0, 200));
            return html;
        } else {
            console.warn('marked.js not loaded, returning cleaned text');
            return cleaned;
        }
    } catch (e) {
        console.error('Error parsing markdown:', e);
        return '<pre>' + escapeHtml(cleaned) + '</pre>';
    }
}

function renderMarkdownPreview(preview, doc, selected, selectedBlocks, hTitle) {
    const htmlParts = [`<h1 class='doc-title h3'>${escapeHtml(hTitle)}</h1>`];

    // Render blocks in the order they were selected
    selectedBlocks.forEach(blockId => {
        const section = doc.sections.find(s => s.id === blockId);
        if (!section) return;

        const chosenId = selected[section.id];
        if (!chosenId) return;
        const version = getVersionById(section, chosenId);
        if (!version) return;

        htmlParts.push(`<h2 class='h5 mt-4'>${escapeHtml(section.title)} <span class='badge text-bg-secondary ms-2'>${escapeHtml(version.label)}</span></h2>`);
        htmlParts.push(`<div class='mb-2 small text-muted'>Version date: ${fmtDate(version.date)}</div>`);

        // Parse and render the markdown content
        const parsedContent = cleanAndParseMarkdown(version.content);
        htmlParts.push(`<div class='section-content'>${parsedContent}</div>`);
    });

    if (htmlParts.length === 1) {
        htmlParts.push(`<div class='text-muted'>No building blocks selected yet. Use the search box above to add building blocks to your document.</div>`);
    }
    preview.innerHTML = htmlParts.join('\n');
}

function mergeAttributesIntoSchema(blockId, section, schemaJson) {
    console.log('=== mergeAttributesIntoSchema ===');
    console.log('blockId:', blockId);
    console.log('section.id:', section.id);
    console.log('section.attributes:', section.attributes);
    console.log('schemaJson:', schemaJson);

    // Deep clone the schema to avoid mutation
    const merged = JSON.parse(JSON.stringify(schemaJson));

    if (!merged.properties) {
        console.log('No properties in schema, returning as-is');
        return merged;
    }

    // Get selected attribute versions for this block
    const selectedAttrVersions = state.selectedAttributeVersions[blockId] || new Map();
    console.log('selectedAttrVersions:', Array.from(selectedAttrVersions.entries()));

    // Process each property
    for (const propName in merged.properties) {
        const prop = merged.properties[propName];

        // Check if this property has a local $ref (starts with ./ or ../attribute/)
        if (prop.$ref && (prop.$ref.startsWith('./') || prop.$ref.includes('/attribute/'))) {
            console.log(`Processing property '${propName}' with $ref: '${prop.$ref}'`);

            // Extract filename from reference:
            // "./sex.schema.json" -> "sex"
            // "./attribute/religion.schema.json" -> "religion"
            // "../attribute/maritalStatus.schema.json" -> "maritalStatus"
            let attrName = prop.$ref
                .replace('./', '')
                .replace('../attribute/', '')
                .replace('./attribute/', '')
                .replace('attribute/', '')
                .replace('.schema.json', '');

            console.log(`Extracted attribute name: '${attrName}'`);

            // Find the attribute in section.attributes
            const attribute = section.attributes?.find(a => a.name === attrName);
            console.log(`Found attribute:`, attribute);

            if (!attribute) {
                console.warn('Attribute not found in section:', attrName);
                console.warn('Available attributes:', section.attributes?.map(a => a.name));
                delete merged.properties[propName];
                continue;
            }

            // Get the selected version ID for this attribute
            const selectedVersionId = selectedAttrVersions.get(attrName);

            if (!selectedVersionId) {
                // No version selected, remove this property
                console.log(`Removing property '${propName}' (no version selected for attribute '${attrName}')`);
                delete merged.properties[propName];
                continue;
            }

            // Find the selected version
            const selectedVersion = attribute.versions.find(v => v.id === selectedVersionId);

            if (!selectedVersion || !selectedVersion.content) {
                console.warn('Selected attribute version not found or has no content:', attrName, selectedVersionId);
                delete merged.properties[propName];
                continue;
            }

            try {
                // Parse the attribute JSON and merge it
                const attrJson = JSON.parse(selectedVersion.content);

                // Preserve description from parent if it exists
                const description = prop.description;

                // Replace $ref with actual attribute content
                merged.properties[propName] = attrJson;

                // Add back description if it existed
                if (description) {
                    merged.properties[propName].description = description;
                }

                console.log(`Merged attribute '${attrName}' version '${selectedVersion.version}' into property '${propName}'`);
            } catch (e) {
                console.error('Failed to parse attribute', attrName, e);
                delete merged.properties[propName];
            }
        }
    }

    // Update required fields to only include properties that still exist
    if (merged.required) {
        const originalRequired = [...merged.required];
        merged.required = merged.required.filter(r => merged.properties.hasOwnProperty(r));

        if (originalRequired.length !== merged.required.length) {
            console.log('Updated required fields from', originalRequired, 'to', merged.required);
        }
    }

    return merged;
}

function renderJsonPreview(preview, doc, selected, selectedBlocks, hTitle) {
    if (selectedBlocks.length === 0) {
        preview.innerHTML = `<div class='text-muted'>No building blocks selected yet. Use the search box above to add building blocks to your document.</div>`;
        return;
    }

    const jsonData = {
        title: hTitle,
        blocks: []
    };

    // Collect JSON from selected blocks
    selectedBlocks.forEach(blockId => {
        const section = doc.sections.find(s => s.id === blockId);
        if (!section) return;

        const chosenId = selected[section.id];
        if (!chosenId) return;
        const version = getVersionById(section, chosenId);
        if (!version || !version.jsonContent) return;

        try {
            const blockJson = JSON.parse(version.jsonContent);

            // Merge attributes into schema, replacing $ref with actual content
            const mergedJson = mergeAttributesIntoSchema(blockId, section, blockJson);

            jsonData.blocks.push({
                id: section.id,
                title: section.title,
                version: version.label,
                data: mergedJson
            });
        } catch (e) {
            console.error('Failed to parse JSON for block', section.id, e);
        }
    });

    // Render formatted JSON
    const jsonStr = JSON.stringify(jsonData, null, 2);
    preview.innerHTML = `<pre style='background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;'><code>${escapeHtml(jsonStr)}</code></pre>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function attachEvents() {
    // View mode toggle
    document.getElementById('viewMarkdown').addEventListener('change', (e) => {
        if (e.target.checked) {
            state.viewMode = 'markdown';
            trackEvent('bb_view_mode_changed', {
                view_mode: 'markdown',
                block_count: state.selectedBlocks.length
            });
            renderPreview();
        }
    });

    document.getElementById('viewJson').addEventListener('change', (e) => {
        if (e.target.checked) {
            state.viewMode = 'json';
            trackEvent('bb_view_mode_changed', {
                view_mode: 'json',
                block_count: state.selectedBlocks.length
            });
            renderPreview();
        }
    });

    // Autocomplete functionality
    const searchInput = document.getElementById('blockSearchInput');
    const autocompleteList = document.getElementById('autocompleteList');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        autocompleteList.innerHTML = '';

        if (query.length === 0) {
            autocompleteList.style.display = 'none';
            return;
        }

        // Filter available blocks
        const matches = state.document.sections
            .filter(section => {
                // Don't show already selected blocks
                if (state.selectedBlocks.includes(section.id)) return false;
                // Match by title
                return section.title.toLowerCase().includes(query);
            })
            .slice(0, 10); // Limit to 10 results

        if (matches.length === 0) {
            autocompleteList.style.display = 'none';
            return;
        }

        matches.forEach(section => {
            const item = el(`<li class='list-group-item list-group-item-action' style='cursor: pointer;' data-block-id='${section.id}'>
                ${section.title}
            </li>`);
            item.addEventListener('click', () => {
                addBlock(section.id);
                searchInput.value = '';
                autocompleteList.style.display = 'none';
            });
            autocompleteList.appendChild(item);
        });

        autocompleteList.style.display = 'block';
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.style.display = 'none';
        }
    });

    // Add block button
    document.getElementById('btnAddBlock').addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            // Find exact match or first match
            const match = state.document.sections.find(s =>
                !state.selectedBlocks.includes(s.id) &&
                s.title.toLowerCase() === query.toLowerCase()
            ) || state.document.sections.find(s =>
                !state.selectedBlocks.includes(s.id) &&
                s.title.toLowerCase().includes(query.toLowerCase())
            );

            if (match) {
                addBlock(match.id);
                searchInput.value = '';
                autocompleteList.style.display = 'none';
            }
        }
    });

    // Enter key to add
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('btnAddBlock').click();
        }
    });

    document.getElementById('btnUseLatest').addEventListener('click', () => {
        // Apply latest versions to all selected blocks
        state.selectedBlocks.forEach(blockId => {
            const section = state.document.sections.find(s => s.id === blockId);
            if (section && section.versions && section.versions.length > 0) {
                const v = latestVersion(section.versions);
                state.selected[section.id] = v.id;
            }
        });
        renderControls();
        renderPreview();

        // Track "Use Latest" action
        trackEvent('bb_use_latest_versions', {
            combination: getCurrentCombination(),
            section_count: state.selectedBlocks.length
        });
    });

    document.getElementById('btnClear').addEventListener('click', () => {
        const previousCombination = getCurrentCombination();
        state.selected = {};
        state.selectedBlocks = [];
        renderControls();
        renderPreview();

        // Track clear action
        trackEvent('bb_clear_selections', {
            previous_combination: previousCombination
        });
    });
    document.getElementById('btnGenerate').addEventListener('click', () => {
        renderPreview();

        // Track document generation with full combination details
        const combination = getCurrentCombination();
        const details = getCombinationDetails();
        trackEvent('bb_document_generated', {
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
        trackEvent('bb_document_copied', {
            combination: combination,
            section_count: Object.keys(state.selected).length,
            combination_details: JSON.stringify(details)
        });
    });
    document.getElementById('btnDownloadHtml').addEventListener('click', () => {
        const content = document.getElementById('previewArea').innerHTML;
        const title = document.getElementById('docTitleInput').value.trim() || 'building-blocks';
        const blob = new Blob([content], {type: 'text/html'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.html`;
        a.click();

        // Track download action with combination
        const combination = getCurrentCombination();
        const details = getCombinationDetails();
        trackEvent('bb_document_downloaded', {
            combination: combination,
            section_count: Object.keys(state.selected).length,
            document_title: title,
            combination_details: JSON.stringify(details),
            format: 'html'
        });
    });
    document.getElementById('btnPrint').addEventListener('click', () => {
        window.print();

        // Track print action with combination
        const combination = getCurrentCombination();
        const details = getCombinationDetails();
        trackEvent('bb_document_printed', {
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
// Discussion Modal Functions
// ============================================

let discussionCategories = [];
let discussionModal = null;

async function loadDiscussionCategories() {
    try {
        const response = await fetch('/api/discussions/categories');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        discussionCategories = data.data?.repository?.discussionCategories?.nodes || [];

        // Populate category dropdown
        const select = document.getElementById('discussionCategory');
        select.innerHTML = '<option value="">Select a category...</option>' +
            discussionCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    } catch (error) {
        console.error('Failed to load discussion categories:', error);
        document.getElementById('discussionCategory').innerHTML = '<option value="">Failed to load categories</option>';
    }
}

function openDiscussionModal(blockId, blockTitle) {
    // Set building block information
    document.getElementById('discussionBuildingBlock').value = blockId;
    document.getElementById('discussionBuildingBlockName').textContent = blockTitle;

    // Clear form
    document.getElementById('discussionTitle').value = '';
    document.getElementById('discussionBody').value = '';
    document.getElementById('discussionError').style.display = 'none';

    // Show modal
    if (!discussionModal) {
        discussionModal = new bootstrap.Modal(document.getElementById('discussionModal'));
    }
    discussionModal.show();
}

async function submitDiscussion() {
    const blockId = document.getElementById('discussionBuildingBlock').value;
    const categoryId = document.getElementById('discussionCategory').value;
    const title = document.getElementById('discussionTitle').value.trim();
    const body = document.getElementById('discussionBody').value.trim();
    const errorDiv = document.getElementById('discussionError');
    const submitBtn = document.getElementById('btnSubmitDiscussion');

    // Validation
    if (!categoryId) {
        errorDiv.textContent = 'Please select a category';
        errorDiv.style.display = 'block';
        return;
    }
    if (!title) {
        errorDiv.textContent = 'Please enter a title';
        errorDiv.style.display = 'block';
        return;
    }
    if (!body) {
        errorDiv.textContent = 'Please enter a description';
        errorDiv.style.display = 'block';
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Creating...';
    errorDiv.style.display = 'none';

    try {
        const response = await fetch('/api/discussions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoryId: categoryId,
                title: title,
                body: body,
                buildingBlockLabel: blockId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create discussion');
        }

        const result = await response.json();

        // Success - close modal and redirect to discussion
        discussionModal.hide();

        if (result.data?.createDiscussion?.discussion?.url) {
            // Open the discussion in a new tab
            window.open(result.data.createDiscussion.discussion.url, '_blank');
        }

        // Show success message
        alert('Discussion created successfully!');

    } catch (error) {
        console.error('Error creating discussion:', error);
        errorDiv.textContent = 'Error: ' + error.message;
        errorDiv.style.display = 'block';
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send me-1"></i>Create Discussion';
    }
}

// ============================================
// Initialization
// ============================================

async function loadDocumentFromBackend() {
    try {
        const response = await fetch('/api/documents/building-blocks');
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
        console.error('Failed to load building blocks from backend:', error);
        console.warn('Using sample data as fallback');
        return structuredClone(sampleDocument);
    }
}

async function init() {
    // Load document from backend
    state.document = await loadDocumentFromBackend();

    console.log('Loaded document:', state.document);
    console.log('Number of sections:', state.document.sections?.length);

    // Log first section details if available
    if (state.document.sections && state.document.sections.length > 0) {
        const firstSection = state.document.sections[0];
        console.log('First section:', firstSection);
        if (firstSection.versions && firstSection.versions.length > 0) {
            console.log('First version of first section:', firstSection.versions[0]);
        }
    }

    // Start with empty selection - user will add blocks manually
    state.selectedBlocks = [];
    state.selected = {};

    renderControls();
    renderPreview();
    attachEvents();
    initConsentBanner();

    // Load discussion categories
    await loadDiscussionCategories();

    // Add event listener for discussion submit button
    document.getElementById('btnSubmitDiscussion').addEventListener('click', submitDiscussion);

    // Track page view
    trackEvent('page_view', {
        page_title: document.title,
        page_path: window.location.pathname
    });
}

document.addEventListener('DOMContentLoaded', init);
