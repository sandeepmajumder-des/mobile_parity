(function() {
  'use strict';

  let studioOverlay = null;
  let isStudioOpen = false;
  /** Snapshot of default `.wf-studio-content` HTML (home) for restoring after sub-panels. */
  let wfStudioMainContentHtml = '';
  /** Snapshot of default `.wf-studio-header` HTML (collapse / minimize / close). */
  let wfStudioMainHeaderHtml = '';

  /** Draft when editing a popup after template pick ({ typeId, templateId }). */
  let popupEditorState = null;

  /** AbortController for popup config visibility listeners (dropdowns / accordions). */
  let popupConfigVisAbort = null;
  /** Active canvas->panel content sync listener for popup config. */
  let popupConfigContentSyncHandler = null;
  /** Popup visibility "screen detection" pick bridge for phone element select mode. */
  let popupWhenElementPickBridge = null;
  /** Smart Tip anchor bridge for phone element select mode. */
  let smartTipAnchorPickBridge = null;
  /** Beacon anchor bridge for phone element select mode. */
  let beaconAnchorPickBridge = null;

  const flowEditorState = {
    name: '',
    description: '',
    tags: '',
    keywords: '',
    apptype: 'ios',
    /** After picking an element on the preview, show the step timeline in the Flow panel. */
    hasTimelineUi: false,
    /** User-confirmed steps from the mobile preview ({ id, label }). */
    flowSteps: [],
    /** When set, next mobile pick updates this step instead of appending. */
    pendingReselectStepId: null,
    /** When set, next preview pick sets displayRules[].targetLabel for this rule. */
    displayRulePick: null,
    /** After display-rule select mode cancel/complete, reopen step editor for this step id. */
    flowSelectReturnToStepEditor: null,
    config: {
      theme: 'modern',
      flowTrigger: true,
      goal: true,
      triggerUserAction: 'select_user_action',
      screenDetectionTiming: 'instant',
      delaySeconds: '',
      frequency: 'every_session'
    }
  };

  function createStudioOverlay() {
    if (studioOverlay) return studioOverlay;

    studioOverlay = document.createElement('div');
    studioOverlay.id = 'whatfix-studio-overlay';
    studioOverlay.className = 'wf-studio-container wf-hidden';
    
    studioOverlay.innerHTML = `
      <!-- Left Sidebar -->
      <div class="wf-studio-sidebar">
        <div class="wf-sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 4L8 12L4 20H8L12 12L8 4H4Z" fill="white"/>
            <path d="M12 4L16 12L12 20H16L20 12L16 4H12Z" fill="white"/>
          </svg>
        </div>
        
        <div class="wf-sidebar-nav">
          <button class="wf-sidebar-btn active" title="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </button>
          <button class="wf-sidebar-btn" title="Flows">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <button class="wf-sidebar-btn add-btn" title="Create New">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
        
        <div class="wf-sidebar-avatar">T</div>
      </div>

      <!-- Main Panel -->
      <div class="wf-studio-panel">
        <!-- Header with controls -->
        <div class="wf-studio-header">
          <button class="wf-control-btn wf-collapse-btn" title="Collapse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="11,17 6,12 11,7"/>
              <polyline points="18,17 13,12 18,7"/>
            </svg>
          </button>
          <button class="wf-control-btn wf-minimize-btn" title="Minimize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button class="wf-control-btn wf-close-btn" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="wf-studio-content">
          <!-- Branding Section -->
          <div class="wf-studio-branding">
            <div class="wf-branding-graphics">
              <div class="wf-shape wf-shape-1"></div>
              <div class="wf-shape wf-shape-2"></div>
              <div class="wf-shape wf-shape-3"></div>
              <div class="wf-shape wf-shape-4"></div>
            </div>
            <h1 class="wf-studio-title">
              <span class="wf-highlight">Studio:</span> Guide. Track. Get feedback. In context. All in one place
            </h1>
          </div>

          <!-- Project Selector -->
          <div class="wf-project-selector">
            <select class="wf-project-dropdown">
              <option value="sharepoint">Sharepoint_Demo</option>
              <option value="salesforce">Salesforce_CRM</option>
              <option value="workday">Workday_HR</option>
            </select>
            <div class="wf-preview-toggle">
              <span>Preview Mode</span>
              <label class="wf-switch">
                <input type="checkbox" id="wf-preview-mode">
                <span class="wf-slider"></span>
              </label>
            </div>
          </div>

          <!-- Content Section -->
          <div class="wf-content-section">
            <div class="wf-section-label">CONTENT</div>
            <div class="wf-content-grid">
              <button class="wf-content-btn" data-content="flows">
                <div class="wf-content-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="6" cy="12" r="2"/>
                    <circle cx="18" cy="6" r="2"/>
                    <circle cx="18" cy="18" r="2"/>
                    <path d="M8 12h6M16.6 7.4L8 11.2M16.6 16.6L8 12.8"/>
                  </svg>
                </div>
                <span>Flows</span>
              </button>
              <button class="wf-content-btn" data-content="link">
                <div class="wf-content-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 1 0-7.07-7.07L10.7 5.22"/>
                    <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.1a5 5 0 1 0 7.07 7.07L13.3 18.8"/>
                  </svg>
                </div>
                <span>Link</span>
              </button>
              <button class="wf-content-btn" data-content="videos">
                <div class="wf-content-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="5" width="14" height="14" rx="2"/>
                    <polygon points="10,10 10,14 14,12"/>
                    <path d="M17 10l4-2v8l-4-2z"/>
                  </svg>
                </div>
                <span>Videos</span>
              </button>
              <button class="wf-content-btn" data-content="cues">
                <div class="wf-content-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z"/>
                    <path d="M3 12l9 4.5 9-4.5"/>
                    <path d="M3 16.5L12 21l9-4.5"/>
                  </svg>
                </div>
                <span>Cues</span>
              </button>
              <button class="wf-content-btn" data-content="article">
                <div class="wf-content-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="4" y="3" width="16" height="18" rx="2"/>
                    <line x1="8" y1="8" x2="16" y2="8"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                    <line x1="8" y1="16" x2="13" y2="16"/>
                  </svg>
                </div>
                <span>Article</span>
              </button>
            </div>
          </div>

          <!-- Widgets Section -->
          <div class="wf-content-section">
            <div class="wf-section-label">WIDGETS</div>
            <div class="wf-widget-grid">
              <button class="wf-widget-btn" data-widget="beacon">
                <div class="wf-widget-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="3"/>
                    <circle cx="12" cy="12" r="7" stroke-dasharray="3 3"/>
                    <circle cx="12" cy="12" r="11" stroke-dasharray="3 3" opacity="0.5"/>
                  </svg>
                </div>
                <span>Beacon</span>
              </button>
              <button class="wf-widget-btn" data-widget="smart-tip">
                <div class="wf-widget-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span>Smart-tip</span>
              </button>
              <button class="wf-widget-btn" data-widget="popup">
                <div class="wf-widget-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                  </svg>
                </div>
                <span>Popup</span>
              </button>
              <button class="wf-widget-btn" data-widget="launcher">
                <div class="wf-widget-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </div>
                <span>Launcher</span>
              </button>
              <button class="wf-widget-btn" data-widget="survey">
                <div class="wf-widget-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <span>Survey</span>
              </button>
            </div>
          </div>

          <!-- Simulation Section -->
          <div class="wf-content-section">
            <div class="wf-section-label">SIMULATION</div>
            <div class="wf-simulation-grid">
              <button class="wf-simulation-btn" data-simulation="mirror">
                <div class="wf-simulation-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="12" y1="3" x2="12" y2="21"/>
                    <rect x="5" y="7" width="4" height="3" rx="0.5"/>
                    <rect x="15" y="7" width="4" height="3" rx="0.5"/>
                  </svg>
                </div>
                <span>Mirror</span>
              </button>
              <button class="wf-simulation-btn" data-simulation="seek">
                <div class="wf-simulation-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="3"/>
                    <line x1="12" y1="3" x2="12" y2="6"/>
                    <line x1="12" y1="18" x2="12" y2="21"/>
                    <line x1="3" y1="12" x2="6" y2="12"/>
                    <line x1="18" y1="12" x2="21" y2="12"/>
                    <line x1="5.64" y1="5.64" x2="7.76" y2="7.76"/>
                    <line x1="16.24" y1="16.24" x2="18.36" y2="18.36"/>
                    <line x1="5.64" y1="18.36" x2="7.76" y2="16.24"/>
                    <line x1="16.24" y1="7.76" x2="18.36" y2="5.64"/>
                  </svg>
                </div>
                <span>Seek</span>
              </button>
            </div>
          </div>

          <!-- Events Section -->
          <div class="wf-content-section">
            <div class="wf-section-label">EVENTS</div>
            <div class="wf-events-grid">
              <button class="wf-event-btn" data-event="user-action">
                <div class="wf-event-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    <rect x="5" y="11" width="14" height="10" rx="2"/>
                    <circle cx="12" cy="16" r="1"/>
                  </svg>
                </div>
                <span>User Action</span>
              </button>
            </div>
          </div>
        </div>

        <div class="wf-flow-saved-overlay wf-hidden" aria-hidden="true">
          <div class="wf-flow-saved-scrim" aria-hidden="true"></div>
          <div class="wf-flow-saved-dialog" role="dialog" aria-modal="true" aria-labelledby="wf-flow-saved-title">
            <div class="wf-flow-saved-head">
              <div class="wf-flow-saved-icon-wrap" aria-hidden="true">
                <span class="wf-flow-saved-icon-ring"></span>
                <span class="wf-flow-saved-icon-core">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
              <h3 class="wf-flow-saved-title" id="wf-flow-saved-title">Flow saved</h3>
            </div>
            <p class="wf-flow-saved-text">
              You can view your saved flow in content section at
              <a href="https://dashboard-automation-seek.vercel.app/" target="_blank" rel="noopener noreferrer" class="wf-flow-saved-dashboard-link">
                Dashboard
                <svg class="wf-flow-saved-external-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>.
            </p>
            <div class="wf-flow-saved-actions">
              <button type="button" class="wf-flow-saved-edit">Edit</button>
              <div class="wf-flow-saved-actions-right">
                <button type="button" class="wf-flow-saved-preview">Preview</button>
                <button type="button" class="wf-flow-saved-okay">Okay</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="wf-job-success-overlay wf-hidden" aria-hidden="true">
        <div class="wf-job-success-scrim" aria-hidden="true"></div>
        <div class="wf-job-success-dialog" role="dialog" aria-modal="true" aria-labelledby="wf-job-success-title">
          <h3 class="wf-job-success-title" id="wf-job-success-title">Job created successfully</h3>
          <p class="wf-job-success-text">
            You can view your job under drafts in the overview section of the
            <a href="https://dashboard-automation-seek.vercel.app/" target="_blank" rel="noopener noreferrer" class="wf-job-success-dashboard-link">
              Seek Dashboard
              <svg class="wf-job-success-external-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </a>.
          </p>
          <div class="wf-job-success-actions">
            <button type="button" class="wf-job-success-edit wf-skill-footer-btn wf-skill-footer-back">Edit</button>
            <button type="button" class="wf-job-success-okay wf-skill-footer-btn wf-skill-footer-done">Okay</button>
          </div>
        </div>
      </div>

      <!-- During screenshot capture: compact bar (panel width), draggable -->
      <div class="wf-studio-capture-minibar" aria-hidden="true">
        <div class="wf-studio-minibar-left">
          <div class="wf-studio-minibar-grab" title="Drag to move" role="separator" aria-orientation="horizontal">
            <span class="wf-studio-minibar-grab-dots" aria-hidden="true">
              <span class="wf-studio-minibar-grab-dot"></span>
              <span class="wf-studio-minibar-grab-dot"></span>
              <span class="wf-studio-minibar-grab-dot"></span>
              <span class="wf-studio-minibar-grab-dot"></span>
              <span class="wf-studio-minibar-grab-dot"></span>
              <span class="wf-studio-minibar-grab-dot"></span>
            </span>
          </div>
          <span class="wf-studio-minibar-seek-label">Seek</span>
        </div>
        <div class="wf-studio-minibar-spacer" aria-hidden="true"></div>
        <div class="wf-studio-minibar-right">
          <span class="wf-studio-minibar-status">capturing skill</span>
          <button type="button" class="wf-studio-minibar-maximize" title="Expand studio" aria-label="Expand studio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Flow: Add step — minimized studio bar while selecting on mobile preview (V2) -->
      <div class="wf-studio-flow-select-minibar" aria-hidden="true">
        <div class="wf-flow-select-minibar-top">
          <div class="wf-flow-select-minibar-left">
            <div class="wf-studio-minibar-grab wf-flow-select-grab" title="Drag to move" role="separator" aria-orientation="horizontal">
              <span class="wf-studio-minibar-grab-dots" aria-hidden="true">
                <span class="wf-studio-minibar-grab-dot"></span>
                <span class="wf-studio-minibar-grab-dot"></span>
                <span class="wf-studio-minibar-grab-dot"></span>
                <span class="wf-studio-minibar-grab-dot"></span>
                <span class="wf-studio-minibar-grab-dot"></span>
                <span class="wf-studio-minibar-grab-dot"></span>
              </span>
            </div>
            <div class="wf-flow-select-minibar-textblock">
              <div class="wf-flow-select-minibar-title">Selecting Element - Add Step</div>
              <div class="wf-flow-select-minibar-sub">Press <strong>Shift+M</strong> for navigation mode…</div>
            </div>
          </div>
          <button type="button" class="wf-flow-select-minibar-cancel">Cancel</button>
        </div>
        <div class="wf-flow-select-minibar-bottom">
          Use <strong>Shift+S</strong> for multi-select mode for similar elements
        </div>
      </div>
    `;

    const dockHost = document.getElementById('browser-content');
    if (dockHost) {
      studioOverlay.classList.add('wf-studio-docked');
      dockHost.appendChild(studioOverlay);
    } else {
      document.body.appendChild(studioOverlay);
    }
    attachEventListeners();
    initCaptureMinibarInteractions();
    initFlowSelectMinibarInteractions();
    initJobSuccessModal();
    initFlowSavedModal();

    const _mainContent = studioOverlay.querySelector('.wf-studio-content');
    if (_mainContent) wfStudioMainContentHtml = _mainContent.innerHTML;
    const _mainHeader = studioOverlay.querySelector('.wf-studio-header');
    if (_mainHeader) wfStudioMainHeaderHtml = _mainHeader.innerHTML;

    return studioOverlay;
  }

  let flowSavedModalEscHandler = null;

  function closeFlowSavedModal() {
    const overlay = studioOverlay?.querySelector('.wf-flow-saved-overlay');
    if (!overlay) return;
    overlay.classList.add('wf-hidden');
    overlay.setAttribute('aria-hidden', 'true');
    if (flowSavedModalEscHandler) {
      document.removeEventListener('keydown', flowSavedModalEscHandler, true);
      flowSavedModalEscHandler = null;
    }
  }

  function openFlowSavedModal() {
    const overlay = studioOverlay?.querySelector('.wf-flow-saved-overlay');
    if (!overlay) return;
    overlay.classList.remove('wf-hidden');
    overlay.setAttribute('aria-hidden', 'false');
    if (flowSavedModalEscHandler) document.removeEventListener('keydown', flowSavedModalEscHandler, true);
    flowSavedModalEscHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeFlowSavedModal();
      }
    };
    document.addEventListener('keydown', flowSavedModalEscHandler, true);
    setTimeout(() => {
      studioOverlay?.querySelector('.wf-flow-saved-okay')?.focus();
    }, 0);
  }

  function initFlowSavedModal() {
    const overlay = studioOverlay?.querySelector('.wf-flow-saved-overlay');
    if (!overlay || overlay.dataset.wfInit === '1') return;
    overlay.dataset.wfInit = '1';
    overlay.querySelector('.wf-flow-saved-okay')?.addEventListener('click', () => {
      closeFlowSavedModal();
      resetToMainView();
    });
    overlay.querySelector('.wf-flow-saved-edit')?.addEventListener('click', () => {
      closeFlowSavedModal();
    });
    overlay.querySelector('.wf-flow-saved-preview')?.addEventListener('click', () => {
      closeFlowSavedModal();
      studioOverlay?.querySelector('.wf-studio-content .wf-flow-preview')?.click();
    });
  }

  let jobSuccessModalEscHandler = null;

  function closeJobSuccessModal() {
    const overlay = studioOverlay?.querySelector('.wf-job-success-overlay');
    if (!overlay) return;
    overlay.classList.add('wf-hidden');
    overlay.setAttribute('aria-hidden', 'true');
    if (jobSuccessModalEscHandler) {
      document.removeEventListener('keydown', jobSuccessModalEscHandler, true);
      jobSuccessModalEscHandler = null;
    }
  }

  function openJobSuccessModal() {
    const overlay = studioOverlay?.querySelector('.wf-job-success-overlay');
    if (!overlay) return;
    overlay.classList.remove('wf-hidden');
    overlay.setAttribute('aria-hidden', 'false');
    if (jobSuccessModalEscHandler) document.removeEventListener('keydown', jobSuccessModalEscHandler, true);
    jobSuccessModalEscHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeJobSuccessModal();
        resetToMainView();
      }
    };
    document.addEventListener('keydown', jobSuccessModalEscHandler, true);
    setTimeout(() => {
      studioOverlay?.querySelector('.wf-job-success-okay')?.focus();
    }, 0);
  }

  function initJobSuccessModal() {
    const overlay = studioOverlay?.querySelector('.wf-job-success-overlay');
    if (!overlay || overlay.dataset.wfInit === '1') return;
    overlay.dataset.wfInit = '1';
    overlay.querySelector('.wf-job-success-okay')?.addEventListener('click', () => {
      closeJobSuccessModal();
      resetToMainView();
    });
    overlay.querySelector('.wf-job-success-edit')?.addEventListener('click', () => {
      closeJobSuccessModal();
      handleSeekAction('record', { resume: true });
    });
  }

  /** Capture session: compact bar (panel width). Shown when capture starts; hidden only via Expand or leaving capture. */
  function showCaptureMinibar() {
    if (!studioOverlay) return;
    studioOverlay.classList.add('wf-studio--capture-minimized');
    const bar = studioOverlay.querySelector('.wf-studio-capture-minibar');
    if (bar) bar.setAttribute('aria-hidden', 'false');
  }

  function hideCaptureMinibar() {
    if (!studioOverlay) return;
    studioOverlay.classList.remove('wf-studio--capture-minimized');
    studioOverlay.style.top = '';
    studioOverlay.style.bottom = '';
    const bar = studioOverlay.querySelector('.wf-studio-capture-minibar');
    if (bar) bar.setAttribute('aria-hidden', 'true');
  }

  function initCaptureMinibarInteractions() {
    if (!studioOverlay) return;
    const maxBtn = studioOverlay.querySelector('.wf-studio-minibar-maximize');
    maxBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      hideCaptureMinibar();
    });

    const grab = studioOverlay.querySelector('.wf-studio-minibar-grab');
    if (!grab || grab.dataset.wfDragInit) return;
    grab.dataset.wfDragInit = '1';
    let dragStartY = 0;
    let dragStartTop = 0;
    grab.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (!studioOverlay.classList.contains('wf-studio--capture-minimized')) return;
      e.preventDefault();
      grab.setPointerCapture(e.pointerId);
      dragStartY = e.clientY;
      dragStartTop = studioOverlay.getBoundingClientRect().top;
      grab.classList.add('wf-studio-minibar-grab--dragging');
    });
    grab.addEventListener('pointermove', (e) => {
      if (!grab.hasPointerCapture(e.pointerId)) return;
      const dy = e.clientY - dragStartY;
      let nextTop = dragStartTop + dy;
      const barH = studioOverlay.offsetHeight || 48;
      const maxTop = Math.max(8, window.innerHeight - barH - 8);
      nextTop = Math.max(8, Math.min(maxTop, nextTop));
      studioOverlay.style.top = `${nextTop}px`;
      studioOverlay.style.bottom = 'auto';
    });
    grab.addEventListener('pointerup', (e) => {
      if (grab.hasPointerCapture(e.pointerId)) {
        grab.releasePointerCapture(e.pointerId);
      }
      grab.classList.remove('wf-studio-minibar-grab--dragging');
    });
    grab.addEventListener('pointercancel', () => {
      grab.classList.remove('wf-studio-minibar-grab--dragging');
    });
  }

  function showFlowSelectMinibar() {
    if (!studioOverlay) return;
    studioOverlay.classList.add('wf-studio--flow-step-select');
    const bar = studioOverlay.querySelector('.wf-studio-flow-select-minibar');
    if (bar) bar.setAttribute('aria-hidden', 'false');
  }

  function hideFlowSelectMinibar() {
    if (!studioOverlay) return;
    studioOverlay.classList.remove('wf-studio--flow-step-select');
    studioOverlay.style.top = '';
    studioOverlay.style.bottom = '';
    const bar = studioOverlay.querySelector('.wf-studio-flow-select-minibar');
    if (bar) bar.setAttribute('aria-hidden', 'true');
  }

  /**
   * @param {object} [opts]
   * @param {'step'|'displayRule'|'smartTipAnchor'|'beaconAnchor'} [opts.mode] - displayRule/smartTipAnchor/beaconAnchor: pick element from mobile preview only.
   * @param {string} [opts.minibarTitle] - Override flow-select minibar title.
   */
  function startFlowStepSelectMode(opts) {
    if (!studioOverlay) return;
    const o = opts && typeof opts === 'object' ? opts : {};
    studioOverlay.classList.remove('wf-studio--capture-minimized');
    hideCaptureMinibar();
    showFlowSelectMinibar();
    const titleEl = studioOverlay.querySelector('.wf-flow-select-minibar-title');
    if (titleEl) {
      titleEl.textContent = o.minibarTitle || 'Selecting Element - Add Step';
    }
    window.dispatchEvent(
      new CustomEvent('wf-flow-step-select', {
        detail: {
          active: true,
          mode:
            o.mode === 'displayRule' || o.mode === 'smartTipAnchor' || o.mode === 'beaconAnchor'
              ? o.mode
              : 'step'
        }
      })
    );
  }

  /**
   * @param {object} [opts]
   * @param {boolean} [opts.suppressPhoneSelectEvent] - If true, do not tell the mobile preview to leave select mode (tooltip still open).
   */
  function endFlowStepSelectMode(opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    hideFlowSelectMinibar();
    const titleEl = studioOverlay?.querySelector('.wf-flow-select-minibar-title');
    if (titleEl) titleEl.textContent = 'Selecting Element - Add Step';
    if (!options.suppressPhoneSelectEvent) {
      window.dispatchEvent(new CustomEvent('wf-flow-step-select', { detail: { active: false } }));
    }
  }

  function initFlowSelectMinibarInteractions() {
    if (!studioOverlay) return;
    const root = studioOverlay.querySelector('.wf-studio-flow-select-minibar');
    if (!root || root.dataset.wfFlowBarInit === '1') return;
    root.dataset.wfFlowBarInit = '1';

    root.querySelector('.wf-flow-select-minibar-cancel')?.addEventListener('click', () => {
      const smartTipPickInProgress = Boolean(smartTipAnchorPickBridge);
      const beaconPickInProgress = Boolean(beaconAnchorPickBridge);
      flowEditorState.pendingReselectStepId = null;
      flowEditorState.displayRulePick = null;
      const returnStepId = flowEditorState.flowSelectReturnToStepEditor;
      flowEditorState.flowSelectReturnToStepEditor = null;
      if (smartTipPickInProgress) smartTipAnchorPickBridge = null;
      if (beaconPickInProgress) beaconAnchorPickBridge = null;
      endFlowStepSelectMode();
      if (smartTipPickInProgress) {
        showPopupTypePanel({ widgetKind: 'smart-tip' });
        return;
      }
      if (beaconPickInProgress) {
        showPopupTypePanel({ widgetKind: 'beacon' });
        return;
      }
      if (returnStepId) {
        showFlowStepEditorPanel(returnStepId, { openAdvancedTab: true });
      } else {
        showFlowPanel();
      }
    });

    const grab = root.querySelector('.wf-flow-select-grab');
    if (!grab) return;
    let dragStartY = 0;
    let dragStartTop = 0;
    grab.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (!studioOverlay.classList.contains('wf-studio--flow-step-select')) return;
      e.preventDefault();
      grab.setPointerCapture(e.pointerId);
      dragStartY = e.clientY;
      dragStartTop = studioOverlay.getBoundingClientRect().top;
      grab.classList.add('wf-studio-minibar-grab--dragging');
    });
    grab.addEventListener('pointermove', (e) => {
      if (!grab.hasPointerCapture(e.pointerId)) return;
      const dy = e.clientY - dragStartY;
      let nextTop = dragStartTop + dy;
      const barH = studioOverlay.offsetHeight || 72;
      const maxTop = Math.max(8, window.innerHeight - barH - 8);
      nextTop = Math.max(8, Math.min(maxTop, nextTop));
      studioOverlay.style.top = `${nextTop}px`;
      studioOverlay.style.bottom = 'auto';
    });
    grab.addEventListener('pointerup', (e) => {
      if (grab.hasPointerCapture(e.pointerId)) {
        grab.releasePointerCapture(e.pointerId);
      }
      grab.classList.remove('wf-studio-minibar-grab--dragging');
    });
    grab.addEventListener('pointercancel', () => {
      grab.classList.remove('wf-studio-minibar-grab--dragging');
    });
  }

  function wireDefaultStudioHeader() {
    if (!studioOverlay) return;
    const closeBtn = studioOverlay.querySelector('.wf-close-btn');
    const minimizeBtn = studioOverlay.querySelector('.wf-minimize-btn');
    const collapseBtn = studioOverlay.querySelector('.wf-collapse-btn');

    closeBtn?.addEventListener('click', () => {
      toggleStudio(false);
    });

    minimizeBtn?.addEventListener('click', () => {
      studioOverlay.classList.toggle('wf-minimized');
    });

    collapseBtn?.addEventListener('click', () => {
      studioOverlay.classList.toggle('wf-collapsed');
    });
  }

  function wirePopupStudioHeader() {
    if (!studioOverlay) return;
    const header = studioOverlay.querySelector('.wf-studio-header');
    const backBtn = header?.querySelector('.wf-header-back-btn');
    const closeBtn = header?.querySelector('.wf-close-btn');
    const minimizeBtn = header?.querySelector('.wf-minimize-btn');
    const moveBtn = header?.querySelector('.wf-move-btn');

    backBtn?.addEventListener('click', () => restoreMainStudioContent());
    closeBtn?.addEventListener('click', () => toggleStudio(false));
    minimizeBtn?.addEventListener('click', () => studioOverlay.classList.toggle('wf-minimized'));
    moveBtn?.addEventListener('click', () => togglePanelSide());
  }

  function attachEventListeners() {
    wireDefaultStudioHeader();

    const sidebarBtns = studioOverlay.querySelectorAll('.wf-sidebar-btn:not(.add-btn)');
    const seekBtn = studioOverlay.querySelector('[data-simulation="seek"]');
    const simulationBtns = studioOverlay.querySelectorAll('.wf-simulation-btn');
    const eventBtns = studioOverlay.querySelectorAll('.wf-event-btn');

    sidebarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sidebarBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    seekBtn?.addEventListener('click', () => {
      showSeekPanel();
    });

    bindMainStudioContentGrid();

    simulationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const simulation = btn.dataset.simulation;
        if (simulation !== 'seek') {
          console.log('Simulation selected:', simulation);
        }
      });
    });

    eventBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const event = btn.dataset.event;
        console.log('Event selected:', event);
      });
    });
  }

  function togglePanelSide() {
    if (!studioOverlay) return;
    studioOverlay.classList.toggle('wf-position-left');
  }

  function wfEscapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  /** Plain text for prefilling Details description from HTML body. */
  function wfPlainTextFromHtml(html) {
    if (html == null) return '';
    return String(html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Same fields as Flow Details tab, with widget-specific labels (Popup / Smart Tip / Beacon).
   * Uses unique ids so it never collides with `#wf-flow-details-*` when Flow panel is open later.
   */
  function buildWidgetDetailsPaneInnerHtml(widgetLabel) {
    const wl = wfEscapeHtml(widgetLabel);
    return (
      `<div class="wf-flow-details-field">` +
      `<label class="wf-flow-details-label" for="wf-widget-details-name">${wl} name</label>` +
      `<input id="wf-widget-details-name" type="text" class="wf-flow-details-input" autocomplete="off" />` +
      `</div>` +
      `<div class="wf-flow-details-field wf-flow-details-field--rte">` +
      `<div class="wf-flow-details-label-row">` +
      `<label class="wf-flow-details-label" for="wf-widget-details-desc">${wl} description <span class="wf-flow-details-optional">(Optional)</span></label>` +
      `<span class="wf-flow-details-hint"><span class="wf-widget-details-desc-count">0</span>/400 Character limit</span>` +
      `</div>` +
      `<div class="wf-flow-details-rte">` +
      `<div class="wf-flow-details-rte-toolbar" aria-hidden="true">` +
      `<div class="wf-flow-details-rte-row">` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Bold"><strong>B</strong></button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Italic"><em>i</em></button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Underline"><span class="wf-flow-details-uline">U</span></button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Text color">A</button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Highlight">\u2710</button>` +
      `<button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Font size">Aa \u25BE</button>` +
      `<button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Alignment">\u2261 \u25BE</button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Link" aria-hidden="true">\u{1F517}</button>` +
      `</div>` +
      `<div class="wf-flow-details-rte-row">` +
      `<button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Numbered list">1. \u25BE</button>` +
      `<button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Bullet list">\u2022 \u25BE</button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Outdent">\u21E4</button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Indent">\u21E5</button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Image" aria-hidden="true">\u{1F5BC}\uFE0F</button>` +
      `<button type="button" class="wf-flow-details-rte-btn" title="Video">\u25B6</button>` +
      `</div>` +
      `</div>` +
      `<textarea id="wf-widget-details-desc" class="wf-flow-details-textarea wf-flow-details-textarea--rte" maxlength="400" rows="5"></textarea>` +
      `</div>` +
      `</div>` +
      `<hr class="wf-flow-details-divider" />` +
      `<div class="wf-flow-details-field">` +
      `<div class="wf-flow-details-label-row">` +
      `<label class="wf-flow-details-label" for="wf-widget-details-tags">Tags <span class="wf-flow-details-optional">(Optional)</span></label>` +
      `<span class="wf-flow-details-hint"><span class="wf-widget-details-tags-count">0</span>/75</span>` +
      `</div>` +
      `<input id="wf-widget-details-tags" type="text" class="wf-flow-details-input" maxlength="75" autocomplete="off" />` +
      `</div>` +
      `<div class="wf-flow-details-field">` +
      `<label class="wf-flow-details-label" for="wf-widget-details-keywords">Keywords <span class="wf-flow-details-optional">(Optional)</span></label>` +
      `<input id="wf-widget-details-keywords" type="text" class="wf-flow-details-input" autocomplete="off" />` +
      `</div>` +
      `<div class="wf-flow-details-field">` +
      `<label class="wf-flow-details-label" for="wf-widget-details-apptype">App type</label>` +
      `<input id="wf-widget-details-apptype" type="text" class="wf-flow-details-input wf-flow-details-apptype-input" value="iOS" disabled readonly aria-label="App type" />` +
      `<p class="wf-flow-details-hint wf-flow-apptype-pairing-hint">Automatically set from screen pairing.</p>` +
      `</div>`
    );
  }

  /** V1 parity: same popup types & templates as `PopupTypeModal.jsx`. */
  const WF_POPUP_TYPES = [
    { id: 'overlay', title: 'Overlay', layout: 'center' },
    { id: 'fullscreen', title: 'Full screen', layout: 'fullscreen' },
    { id: 'drawer', title: 'Drawer', layout: 'drawer' },
    { id: 'bottomsheet', title: 'Bottom sheet', layout: 'bottomsheet' },
    { id: 'carousel', title: 'Carousel', layout: 'carousel' },
    { id: 'snackbar', title: 'Snackbar', layout: 'snackbar' },
    { id: 'banner', title: 'Banner', layout: 'banner' }
  ];

  const WF_POPUP_TEMPLATES = {
    overlay: [
      { id: 'overlay-1', name: 'Light Theme' },
      { id: 'overlay-2', name: 'Dark Theme' },
      { id: 'overlay-3', name: 'Two Buttons' },
      { id: 'overlay-4', name: 'Three Buttons' },
      { id: 'overlay-5', name: 'Left Aligned' },
      { id: 'overlay-6', name: 'Right Aligned' }
    ],
    fullscreen: [
      { id: 'fullscreen-1', name: 'Light Theme' },
      { id: 'fullscreen-2', name: 'Dark Theme' },
      { id: 'fullscreen-3', name: 'Two Buttons' },
      { id: 'fullscreen-4', name: 'Three Buttons' },
      { id: 'fullscreen-5', name: 'With Image' },
      { id: 'fullscreen-6', name: 'Minimal' }
    ],
    drawer: [
      { id: 'drawer-1', name: 'Light Theme' },
      { id: 'drawer-2', name: 'Dark Theme' },
      { id: 'drawer-3', name: 'Two Buttons' },
      { id: 'drawer-4', name: 'With Header' },
      { id: 'drawer-5', name: 'Scrollable' },
      { id: 'drawer-6', name: 'Minimal' }
    ],
    bottomsheet: [
      { id: 'bottomsheet-1', name: 'Light Theme' },
      { id: 'bottomsheet-2', name: 'Dark Theme' },
      { id: 'bottomsheet-3', name: 'Two Buttons' },
      { id: 'bottomsheet-4', name: 'Three Buttons' },
      { id: 'bottomsheet-5', name: 'With List' },
      { id: 'bottomsheet-6', name: 'Compact' }
    ],
    carousel: [
      { id: 'carousel-1', name: 'Light Theme' },
      { id: 'carousel-2', name: 'Dark Theme' },
      { id: 'carousel-3', name: 'Five Cards' },
      { id: 'carousel-4', name: 'With Dots' },
      { id: 'carousel-5', name: 'Auto Play' },
      { id: 'carousel-6', name: 'Minimal' }
    ],
    snackbar: [
      { id: 'snackbar-1', name: 'Light Theme' },
      { id: 'snackbar-2', name: 'Dark Theme' },
      { id: 'snackbar-3', name: 'No Action' },
      { id: 'snackbar-4', name: 'With Icon' },
      { id: 'snackbar-5', name: 'Success' },
      { id: 'snackbar-6', name: 'Error' }
    ],
    banner: [
      { id: 'banner-1', name: 'Light Theme' },
      { id: 'banner-2', name: 'Dark Theme' },
      { id: 'banner-3', name: 'Two Buttons' },
      { id: 'banner-4', name: 'With Icon' },
      { id: 'banner-5', name: 'Dismissible' },
      { id: 'banner-6', name: 'Compact' }
    ]
  };

  const WF_WIDGET_TYPE_CATALOG = {
    popup: {
      label: 'Popup',
      typeLabel: 'popup type',
      types: WF_POPUP_TYPES,
      templates: WF_POPUP_TEMPLATES
    },
    'smart-tip': {
      label: 'Smart Tip',
      typeLabel: 'smart tip type',
      types: [
        { id: 'anchored', title: 'Anchored tip', layout: 'center' },
        { id: 'inline', title: 'Inline tip', layout: 'banner' },
        { id: 'tooltip', title: 'Tooltip', layout: 'snackbar' }
      ],
      templates: {
        anchored: [{ id: 'anchored-1', name: 'Anchored tip' }],
        inline: [{ id: 'inline-1', name: 'Inline tip' }],
        tooltip: [{ id: 'tooltip-1', name: 'Tooltip' }]
      }
    },
    beacon: {
      label: 'Beacon',
      typeLabel: 'beacon type',
      types: [
        { id: 'pulse', title: 'Pulse', layout: 'center' },
        { id: 'ring', title: 'Ring', layout: 'fullscreen' },
        { id: 'dot', title: 'Dot', layout: 'snackbar' },
        { id: 'badge', title: 'Badge', layout: 'banner' },
        { id: 'spotlight', title: 'Spotlight', layout: 'carousel' },
        { id: 'nudge', title: 'Nudge', layout: 'drawer' }
      ],
      templates: {
        pulse: [
          { id: 'pulse-1', name: 'Pulse Variant 1' },
          { id: 'pulse-2', name: 'Pulse Variant 2' },
          { id: 'pulse-3', name: 'Pulse Variant 3' },
          { id: 'pulse-4', name: 'Pulse Variant 4' },
          { id: 'pulse-5', name: 'Pulse Variant 5' },
          { id: 'pulse-6', name: 'Pulse Variant 6' }
        ],
        ring: [
          { id: 'ring-1', name: 'Ring Variant 1' },
          { id: 'ring-2', name: 'Ring Variant 2' },
          { id: 'ring-3', name: 'Ring Variant 3' },
          { id: 'ring-4', name: 'Ring Variant 4' },
          { id: 'ring-5', name: 'Ring Variant 5' },
          { id: 'ring-6', name: 'Ring Variant 6' }
        ],
        dot: [
          { id: 'dot-1', name: 'Dot Variant 1' },
          { id: 'dot-2', name: 'Dot Variant 2' },
          { id: 'dot-3', name: 'Dot Variant 3' },
          { id: 'dot-4', name: 'Dot Variant 4' },
          { id: 'dot-5', name: 'Dot Variant 5' },
          { id: 'dot-6', name: 'Dot Variant 6' }
        ],
        badge: [
          { id: 'badge-1', name: 'Badge Variant 1' },
          { id: 'badge-2', name: 'Badge Variant 2' },
          { id: 'badge-3', name: 'Badge Variant 3' },
          { id: 'badge-4', name: 'Badge Variant 4' },
          { id: 'badge-5', name: 'Badge Variant 5' },
          { id: 'badge-6', name: 'Badge Variant 6' }
        ],
        spotlight: [
          { id: 'spotlight-1', name: 'Spotlight Variant 1' },
          { id: 'spotlight-2', name: 'Spotlight Variant 2' },
          { id: 'spotlight-3', name: 'Spotlight Variant 3' },
          { id: 'spotlight-4', name: 'Spotlight Variant 4' },
          { id: 'spotlight-5', name: 'Spotlight Variant 5' },
          { id: 'spotlight-6', name: 'Spotlight Variant 6' }
        ],
        nudge: [
          { id: 'nudge-1', name: 'Nudge Variant 1' },
          { id: 'nudge-2', name: 'Nudge Variant 2' },
          { id: 'nudge-3', name: 'Nudge Variant 3' },
          { id: 'nudge-4', name: 'Nudge Variant 4' },
          { id: 'nudge-5', name: 'Nudge Variant 5' },
          { id: 'nudge-6', name: 'Nudge Variant 6' }
        ]
      }
    }
  };

  /** Popup visibility — same options as MobileStudio / FlowStudio V1 (popup tab). */
  const WF_PVIS_TRASH_SVG =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  const WF_PVIS_PLUS_SVG =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  const WF_PVIS_CHV_SVG =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

  const WF_POPUP_WHERE_OPTS = [
    {
      value: 'url',
      label: 'URL',
      description: 'Only the page with a specific URL',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="where-showon-option-icon"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'
    },
    {
      value: 'domain',
      label: 'Domain',
      description: 'All pages that start with the current domain',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="where-showon-option-icon"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    },
    {
      value: 'url-path',
      label: 'URL path',
      description: 'Pages with URLs that contain a particular path',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="where-showon-option-icon"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a2.5 2.5 0 0 0 0-5H9a2.5 2.5 0 0 1 0-5H17"/><circle cx="18" cy="5" r="3"/></svg>'
    },
    {
      value: 'url-parameter',
      label: 'URL parameter',
      description: 'Pages with a specified URL parameter',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="where-showon-option-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
    },
    {
      value: 'url-hash',
      label: 'URL hash value',
      description: 'Pages with specified URL hash value',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="where-showon-option-icon"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>'
    },
    {
      value: 'page-tags',
      label: 'Page tags',
      description: 'Pages that have the specified page tag',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="where-showon-option-icon"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>'
    }
  ];

  const WF_POPUP_WHEN_OPTS = [
    {
      value: 'specific-date-range',
      label: 'Specific date range',
      description: 'Define a period during which the popup should appear',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="when-cause-option-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    },
    {
      value: 'something-on-application',
      label: 'Something on the application',
      description: 'An event or state that triggers the popup',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="when-cause-option-icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
    },
    {
      value: 'screen-detection',
      label: 'Screen detection',
      description: 'Show popup when a selected element is detected on screen',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="when-cause-option-icon"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/><circle cx="12" cy="11" r="2.2"/><path d="M12 6v1.2"/><path d="M12 14.8V16"/><path d="M7 11h1.2"/><path d="M15.8 11H17"/></svg>'
    }
  ];

  const WF_POPUP_WHO_OPTS = [
    {
      value: 'enterprise-attributes',
      label: 'Enterprise Attributes',
      description: 'Identify the user by enterprise-level attributes'
    },
    {
      value: 'user-attributes',
      label: 'User Attributes',
      description: 'Identify the user by user-level attributes'
    }
  ];

  function wfPopupVisAvailableWhere(conditions, condId) {
    const self = conditions.find((c) => c.id === condId);
    return WF_POPUP_WHERE_OPTS.filter(
      (opt) =>
        (self && opt.value === self.showOn) || !conditions.some((c) => c.id !== condId && c.showOn === opt.value)
    );
  }

  function wfPopupVisAvailableWhen(conditions, condId) {
    const self = conditions.find((c) => c.id === condId);
    return WF_POPUP_WHEN_OPTS.filter(
      (opt) =>
        (self && opt.value === self.cause) || !conditions.some((c) => c.id !== condId && c.cause === opt.value)
    );
  }

  function wfPopupVisAvailableWho(conditions, condId) {
    const self = conditions.find((c) => c.id === condId);
    return WF_POPUP_WHO_OPTS.filter(
      (opt) =>
        (self && opt.value === self.identifyBy) || !conditions.some((c) => c.id !== condId && c.identifyBy === opt.value)
    );
  }

  function buildPopupVisibilityAccordionsHtml(vis) {
    function whereSection() {
      const cards = vis.where
        .map((cond, i) => {
          const idx = i + 1;
          const selected = WF_POPUP_WHERE_OPTS.find((o) => o.value === cond.showOn);
          const open = vis.openWhere === cond.id;
          const opts = wfPopupVisAvailableWhere(vis.where, cond.id);
          const listHtml = open
            ? `<div class="where-showon-list" role="listbox">${opts
                .map(
                  (opt) => `<button type="button" role="option" class="where-showon-option ${cond.showOn === opt.value ? 'selected' : ''}" data-wf-pvis-where-pick="${cond.id}" data-wf-pvis-value="${opt.value}">
                    ${opt.icon}
                    <div class="where-showon-option-text"><span class="where-showon-option-label">${opt.label}</span><span class="where-showon-option-desc">${opt.description}</span></div>
                  </button>`
                )
                .join('')}</div>`
            : '';
          return `<div class="where-condition-card" data-wf-pvis-where-card="${cond.id}">
            <div class="where-condition-header">
              <span class="where-condition-label">Condition ${idx}</span>
              <button type="button" class="where-condition-delete" data-wf-pvis-where-del="${cond.id}" aria-label="Delete condition" ${vis.where.length < 2 ? 'disabled style="opacity:0.35;pointer-events:none"' : ''}>${WF_PVIS_TRASH_SVG}</button>
            </div>
            <div class="where-condition-row">
              <label class="where-condition-show-label">Show on</label>
              <div class="where-condition-select-wrap">
                <div class="where-showon-dropdown">
                  <button type="button" class="where-showon-trigger ${cond.showOn ? 'has-value' : ''}" data-wf-pvis-where-trigger="${cond.id}" aria-expanded="${open}" aria-haspopup="listbox">
                    <span class="where-showon-trigger-text">${selected ? selected.label : 'Select'}</span>
                    ${WF_PVIS_CHV_SVG.replace('<svg', `<svg class="where-showon-chevron${open ? ' open' : ''}"`)}
                  </button>
                  ${listHtml}
                </div>
              </div>
            </div>
          </div>`;
        })
        .join('');
      return `${cards}<button type="button" class="where-add-condition-btn" data-wf-pvis-where-add>${WF_PVIS_PLUS_SVG} Add condition</button>`;
    }

    function whenSection() {
      const cards = vis.when
        .map((cond, i) => {
          const idx = i + 1;
          const selected = WF_POPUP_WHEN_OPTS.find((o) => o.value === cond.cause);
          const open = vis.openWhen === cond.id;
          const opts = wfPopupVisAvailableWhen(vis.when, cond.id);
          const listHtml = open
            ? `<div class="when-cause-list" role="listbox">${opts
                .map(
                  (opt) => `<button type="button" role="option" class="when-cause-option ${cond.cause === opt.value ? 'selected' : ''}" data-wf-pvis-when-pick="${cond.id}" data-wf-pvis-value="${opt.value}">
                    ${opt.icon}
                    <div class="when-cause-option-text"><span class="when-cause-option-label">${opt.label}</span><span class="when-cause-option-desc">${opt.description}</span></div>
                  </button>`
                )
                .join('')}</div>`
            : '';
          const isScreenDetection = cond.cause === 'screen-detection';
          const screenFields = isScreenDetection
            ? `<div class="wf-popup-when-screen-fields">
                <label class="wf-popup-when-screen-label">Element detection</label>
                <div class="wf-step-display-rule-dd-row">
                  <div class="wf-step-display-rule-dd wf-step-display-rule-dd--highlight">
                    <select class="wf-step-display-rule-select wf-popup-when-screen-select" data-wf-pvis-when-target-select="${cond.id}">
                      <option value="" ${!cond.targetSelectValue ? 'selected' : ''}>Select Element</option>
                      <option value="primary" ${cond.targetSelectValue === 'primary' ? 'selected' : ''}>Primary target</option>
                      <option value="secondary" ${cond.targetSelectValue === 'secondary' ? 'selected' : ''}>Secondary target</option>
                    </select>
                  </div>
                  ${
                    cond.targetLabel
                      ? `<div class="wf-step-display-rule-picked-row">
                           <input type="text" class="wf-step-display-rule-picked-input" readonly value="${wfEscapeHtml(cond.targetLabel)}" />
                           <button type="button" class="wf-step-display-rule-picked-delete" data-wf-pvis-when-pick-clear="${cond.id}" aria-label="Clear selected element">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                               <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                             </svg>
                           </button>
                         </div>`
                      : `<button type="button" class="wf-step-display-rule-pick-btn" data-wf-pvis-when-pick-element="${cond.id}">Select</button>`
                  }
                </div>
                <label class="wf-popup-when-screen-label" for="wf-pvis-when-detect-${cond.id}">Detection timing</label>
                <div class="wf-step-display-rule-dd">
                  <select id="wf-pvis-when-detect-${cond.id}" class="wf-step-display-rule-select" data-wf-pvis-when-detect="${cond.id}">
                    <option value="instant" ${cond.detectionTiming === 'instant' ? 'selected' : ''}>Instant</option>
                    <option value="stable-500ms" ${cond.detectionTiming === 'stable-500ms' ? 'selected' : ''}>Stable for 500ms</option>
                    <option value="stable-1000ms" ${cond.detectionTiming === 'stable-1000ms' ? 'selected' : ''}>Stable for 1 second</option>
                  </select>
                </div>
              </div>`
            : '';

          return `<div class="when-condition-card" data-wf-pvis-when-card="${cond.id}">
            <div class="when-condition-header">
              <span class="when-condition-label">Start condition ${idx}</span>
              <button type="button" class="when-condition-delete" data-wf-pvis-when-del="${cond.id}" aria-label="Delete start condition" ${vis.when.length < 2 ? 'disabled style="opacity:0.35;pointer-events:none"' : ''}>${WF_PVIS_TRASH_SVG}</button>
            </div>
            <div class="when-condition-row">
              <label class="when-condition-cause-label">What causes the popup to appear?</label>
              <div class="when-condition-select-wrap">
                <div class="when-cause-dropdown">
                  <button type="button" class="when-cause-trigger ${cond.cause ? 'has-value' : ''}" data-wf-pvis-when-trigger="${cond.id}" aria-expanded="${open}" aria-haspopup="listbox">
                    <span class="when-cause-trigger-text">${selected ? selected.label : 'Select'}</span>
                    ${WF_PVIS_CHV_SVG.replace('<svg', `<svg class="when-cause-chevron${open ? ' open' : ''}"`)}
                  </button>
                  ${listHtml}
                </div>
              </div>
              ${screenFields}
            </div>
          </div>`;
        })
        .join('');
      const startBlock = `${cards}<button type="button" class="when-add-condition-btn" data-wf-pvis-when-add>${WF_PVIS_PLUS_SVG} Add condition</button>`;
      const mode = vis.whenFrequencyMode || 'set-number';
      const count = vis.whenFrequencyCount != null && vis.whenFrequencyCount >= 1 ? vis.whenFrequencyCount : 1;
      const countFields =
        mode === 'set-number'
          ? `<div class="wf-popup-when-field">
          <label class="wf-popup-when-field-label" for="wf-pvis-when-freq-count">No of times</label>
          <input type="number" id="wf-pvis-when-freq-count" class="wf-skill-text-input" min="1" step="1" data-wf-pvis-when-freq-count value="${count}" />
        </div>`
          : '';
      const infoIcon =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      const endCard = `<div class="wf-popup-when-end-card">
        <div class="wf-popup-when-end-card-head">
          <span class="wf-popup-when-end-card-title">End condition</span>
        </div>
        <div class="wf-popup-when-end-card-body">
          <div class="wf-popup-when-info-banner" role="status">
            <span class="wf-popup-when-info-icon">${infoIcon}</span>
            <p class="wf-popup-when-info-text">The pop up won't appear unless all the start conditions are met.</p>
          </div>
          <div class="wf-popup-when-field">
            <label class="wf-popup-when-field-label" for="wf-pvis-when-freq-mode">How many times should the pop up show up?</label>
            <select id="wf-pvis-when-freq-mode" class="wf-skill-text-input wf-popup-when-freq-select" data-wf-pvis-when-freq-mode>
              <option value="set-number" ${mode === 'set-number' ? 'selected' : ''}>A set number of times</option>
              <option value="once-session" ${mode === 'once-session' ? 'selected' : ''}>Once per session</option>
              <option value="unlimited" ${mode === 'unlimited' ? 'selected' : ''}>Whenever start conditions are met</option>
            </select>
          </div>
          ${countFields}
        </div>
      </div>`;
      return `<div class="wf-popup-when-stack">
        <h4 class="wf-popup-when-subheading">When does the pop up start appearing?</h4>
        <div class="when-conditions">${startBlock}</div>
        <h4 class="wf-popup-when-subheading">When does the pop up stop appearing?</h4>
        ${endCard}
      </div>`;
    }

    function whoSection() {
      const cards = vis.who
        .map((cond, i) => {
          const idx = i + 1;
          const selected = WF_POPUP_WHO_OPTS.find((o) => o.value === cond.identifyBy);
          const open = vis.openWho === cond.id;
          const opts = wfPopupVisAvailableWho(vis.who, cond.id);
          const listHtml = open
            ? `<div class="who-identify-list" role="listbox">${opts
                .map(
                  (opt) => `<button type="button" role="option" class="who-identify-option ${cond.identifyBy === opt.value ? 'selected' : ''}" data-wf-pvis-who-pick="${cond.id}" data-wf-pvis-value="${opt.value}">
                    <div class="who-identify-option-text"><span class="who-identify-option-label">${opt.label}</span><span class="who-identify-option-desc">${opt.description}</span></div>
                  </button>`
                )
                .join('')}</div>`
            : '';
          return `<div class="who-condition-card" data-wf-pvis-who-card="${cond.id}">
            <div class="who-condition-header">
              <span class="who-condition-label">Condition ${idx}</span>
              <button type="button" class="who-condition-delete" data-wf-pvis-who-del="${cond.id}" aria-label="Delete condition" ${vis.who.length < 2 ? 'disabled style="opacity:0.35;pointer-events:none"' : ''}>${WF_PVIS_TRASH_SVG}</button>
            </div>
            <div class="who-condition-row">
              <label class="who-condition-identify-label">How would you like to identify the user?</label>
              <div class="who-condition-select-wrap">
                <div class="who-identify-dropdown">
                  <button type="button" class="who-identify-trigger ${cond.identifyBy ? 'has-value' : ''}" data-wf-pvis-who-trigger="${cond.id}" aria-expanded="${open}" aria-haspopup="listbox">
                    <span class="who-identify-trigger-text">${selected ? selected.label : 'Select'}</span>
                    ${WF_PVIS_CHV_SVG.replace('<svg', `<svg class="who-identify-chevron${open ? ' open' : ''}"`)}
                  </button>
                  ${listHtml}
                </div>
              </div>
            </div>
          </div>`;
        })
        .join('');
      return `${cards}<button type="button" class="who-add-condition-btn" data-wf-pvis-who-add>${WF_PVIS_PLUS_SVG} Add condition</button>`;
    }

    const accItem = (key, exp, label, iconInner, hint, bodyHtml) => {
      const expanded = vis[key];
      return `<div class="wf-visibility-accordion-item ${expanded ? 'wf-visibility-accordion-expanded' : ''}">
        <button type="button" class="wf-visibility-accordion-trigger" aria-expanded="${expanded ? 'true' : 'false'}" data-wf-pvis-acc="${exp}">
          <span class="wf-visibility-accordion-icon" aria-hidden="true">${iconInner}</span>
          <span class="wf-visibility-accordion-label">${label}</span>
          <span class="wf-visibility-accordion-chevron" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </button>
        <div class="wf-visibility-accordion-panel" ${expanded ? '' : 'hidden'} data-wf-pvis-acc-panel="${exp}">
          <div class="wf-visibility-panel-inner">
            <p class="config-placeholder-text">${hint}</p>
            ${bodyHtml}
          </div>
        </div>
      </div>`;
    };

    const iconPin =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    const iconClock =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const iconWho =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';

    return `<div class="wf-visibility-accordions wf-popup-vis-stack">
      ${accItem(
        'expWhere',
        'where',
        'Where does the pop up appear?',
        iconPin,
        'Configure where the popup will appear in the app.',
        `<div class="where-conditions">${whereSection()}</div>`
      )}
      ${accItem(
        'expWhen',
        'when',
        'When does the pop up start and stop appearing?',
        iconClock,
        'Set the timing rules for when the popup starts and stops appearing.',
        whenSection()
      )}
      ${accItem(
        'expWho',
        'who',
        'Who does the pop up appear to?',
        iconWho,
        'Define the audience targeting rules for this popup.',
        `<div class="who-conditions">${whoSection()}</div>`
      )}
    </div>`;
  }

  function wirePopupConfigVisibility(content, vis, renderVis) {
    if (popupConfigVisAbort) popupConfigVisAbort.abort();
    popupConfigVisAbort = new AbortController();
    const sig = popupConfigVisAbort.signal;

    function closeDropdowns() {
      vis.openWhere = vis.openWhen = vis.openWho = null;
    }

    content.addEventListener(
      'click',
      (e) => {
        const t = e.target;
        if (!t.closest || !t.closest('[data-popup-config-panel="visibility"]')) return;

        const acc = t.closest('[data-wf-pvis-acc]');
        if (acc) {
          const k = acc.getAttribute('data-wf-pvis-acc');
          if (k === 'where') {
            vis.expWhere = !vis.expWhere;
            if (!vis.expWhere) closeDropdowns();
          } else if (k === 'when') {
            vis.expWhen = !vis.expWhen;
            if (!vis.expWhen) closeDropdowns();
          } else if (k === 'who') {
            vis.expWho = !vis.expWho;
            if (!vis.expWho) closeDropdowns();
          }
          renderVis();
          return;
        }

        const wTrig = t.closest('[data-wf-pvis-where-trigger]');
        if (wTrig) {
          e.preventDefault();
          const id = Number(wTrig.getAttribute('data-wf-pvis-where-trigger'));
          vis.openWhere = vis.openWhere === id ? null : id;
          vis.openWhen = vis.openWho = null;
          renderVis();
          return;
        }
        const wPick = t.closest('[data-wf-pvis-where-pick]');
        if (wPick) {
          const id = Number(wPick.getAttribute('data-wf-pvis-where-pick'));
          const val = wPick.getAttribute('data-wf-pvis-value');
          vis.where = vis.where.map((c) => (c.id === id ? { ...c, showOn: val } : c));
          vis.openWhere = null;
          renderVis();
          return;
        }
        if (t.closest('[data-wf-pvis-where-add]')) {
          vis.where = [...vis.where, { id: Date.now(), showOn: '' }];
          closeDropdowns();
          renderVis();
          return;
        }
        const wDel = t.closest('[data-wf-pvis-where-del]');
        if (wDel && vis.where.length > 1) {
          const id = Number(wDel.getAttribute('data-wf-pvis-where-del'));
          vis.where = vis.where.filter((c) => c.id !== id);
          if (vis.openWhere === id) vis.openWhere = null;
          renderVis();
          return;
        }

        const whTrig = t.closest('[data-wf-pvis-when-trigger]');
        if (whTrig) {
          e.preventDefault();
          const id = Number(whTrig.getAttribute('data-wf-pvis-when-trigger'));
          vis.openWhen = vis.openWhen === id ? null : id;
          vis.openWhere = vis.openWho = null;
          renderVis();
          return;
        }
        const whPick = t.closest('[data-wf-pvis-when-pick]');
        if (whPick) {
          const id = Number(whPick.getAttribute('data-wf-pvis-when-pick'));
          const val = whPick.getAttribute('data-wf-pvis-value');
          vis.when = vis.when.map((c) =>
            c.id === id
              ? {
                  ...c,
                  cause: val,
                  targetLabel: val === 'screen-detection' ? c.targetLabel || '' : '',
                  targetSelectValue: val === 'screen-detection' ? c.targetSelectValue || '' : '',
                  detectionTiming: val === 'screen-detection' ? c.detectionTiming || 'instant' : 'instant'
                }
              : c
          );
          vis.openWhen = null;
          renderVis();
          return;
        }
        if (t.closest('[data-wf-pvis-when-add]')) {
          vis.when = [
            ...vis.when,
            { id: Date.now(), cause: '', targetLabel: '', targetSelectValue: '', detectionTiming: 'instant' }
          ];
          closeDropdowns();
          renderVis();
          return;
        }
        const whDel = t.closest('[data-wf-pvis-when-del]');
        if (whDel && vis.when.length > 1) {
          const id = Number(whDel.getAttribute('data-wf-pvis-when-del'));
          vis.when = vis.when.filter((c) => c.id !== id);
          if (vis.openWhen === id) vis.openWhen = null;
          renderVis();
          return;
        }

        const whPickElement = t.closest('[data-wf-pvis-when-pick-element]');
        if (whPickElement) {
          const id = Number(whPickElement.getAttribute('data-wf-pvis-when-pick-element'));
          popupWhenElementPickBridge = {
            onPicked: (label) => {
              vis.when = vis.when.map((c) => (c.id === id ? { ...c, targetLabel: label } : c));
              renderVis();
            }
          };
          startFlowStepSelectMode({
            mode: 'displayRule',
            minibarTitle: 'Select element for popup trigger'
          });
          return;
        }

        const whPickClear = t.closest('[data-wf-pvis-when-pick-clear]');
        if (whPickClear) {
          const id = Number(whPickClear.getAttribute('data-wf-pvis-when-pick-clear'));
          vis.when = vis.when.map((c) => (c.id === id ? { ...c, targetLabel: '' } : c));
          renderVis();
          return;
        }

        const woTrig = t.closest('[data-wf-pvis-who-trigger]');
        if (woTrig) {
          e.preventDefault();
          const id = Number(woTrig.getAttribute('data-wf-pvis-who-trigger'));
          vis.openWho = vis.openWho === id ? null : id;
          vis.openWhere = vis.openWhen = null;
          renderVis();
          return;
        }
        const woPick = t.closest('[data-wf-pvis-who-pick]');
        if (woPick) {
          const id = Number(woPick.getAttribute('data-wf-pvis-who-pick'));
          const val = woPick.getAttribute('data-wf-pvis-value');
          vis.who = vis.who.map((c) => (c.id === id ? { ...c, identifyBy: val } : c));
          vis.openWho = null;
          renderVis();
          return;
        }
        if (t.closest('[data-wf-pvis-who-add]')) {
          vis.who = [...vis.who, { id: Date.now(), identifyBy: '' }];
          closeDropdowns();
          renderVis();
          return;
        }
        const woDel = t.closest('[data-wf-pvis-who-del]');
        if (woDel && vis.who.length > 1) {
          const id = Number(woDel.getAttribute('data-wf-pvis-who-del'));
          vis.who = vis.who.filter((c) => c.id !== id);
          if (vis.openWho === id) vis.openWho = null;
          renderVis();
          return;
        }
      },
      { signal: sig }
    );

    content.addEventListener(
      'change',
      (e) => {
        if (!e.target.closest?.('[data-popup-config-panel="visibility"]')) return;
        const t = e.target;
        if (t.matches('[data-wf-pvis-when-freq-mode]')) {
          vis.whenFrequencyMode = t.value;
          renderVis();
          return;
        }
        if (t.matches('[data-wf-pvis-when-freq-count]')) {
          let v = parseInt(t.value, 10);
          if (!Number.isFinite(v) || v < 1) v = 1;
          vis.whenFrequencyCount = v;
          t.value = String(v);
          return;
        }
        if (t.matches('[data-wf-pvis-when-target-select]')) {
          const id = Number(t.getAttribute('data-wf-pvis-when-target-select'));
          vis.when = vis.when.map((c) => (c.id === id ? { ...c, targetSelectValue: t.value || '' } : c));
          return;
        }
        if (t.matches('[data-wf-pvis-when-detect]')) {
          const id = Number(t.getAttribute('data-wf-pvis-when-detect'));
          vis.when = vis.when.map((c) =>
            c.id === id ? { ...c, detectionTiming: t.value || 'instant' } : c
          );
        }
      },
      { signal: sig }
    );

    content.addEventListener(
      'input',
      (e) => {
        if (!e.target.closest?.('[data-popup-config-panel="visibility"]')) return;
        if (!e.target.matches('[data-wf-pvis-when-freq-count]')) return;
        const v = parseInt(e.target.value, 10);
        if (Number.isFinite(v) && v >= 1) vis.whenFrequencyCount = v;
      },
      { signal: sig }
    );

    document.addEventListener(
      'mousedown',
      (e) => {
        if (vis.openWhere == null && vis.openWhen == null && vis.openWho == null) return;
        if (
          e.target.closest('.where-showon-dropdown') ||
          e.target.closest('.when-cause-dropdown') ||
          e.target.closest('.who-identify-dropdown')
        ) {
          return;
        }
        closeDropdowns();
        renderVis();
      },
      { signal: sig, capture: true }
    );
  }

  function restoreMainStudioContent() {
    if (popupConfigVisAbort) {
      popupConfigVisAbort.abort();
      popupConfigVisAbort = null;
    }
    if (popupConfigContentSyncHandler) {
      window.removeEventListener('wf-popup-content-updated', popupConfigContentSyncHandler);
      popupConfigContentSyncHandler = null;
    }
    const content = studioOverlay?.querySelector('.wf-studio-content');
    const header = studioOverlay?.querySelector('.wf-studio-header');
    if (header && wfStudioMainHeaderHtml) header.innerHTML = wfStudioMainHeaderHtml;
    if (content && wfStudioMainContentHtml) content.innerHTML = wfStudioMainContentHtml;
    wireDefaultStudioHeader();
    bindMainStudioContentGrid();
  }

  function bindMainStudioContentGrid() {
    if (!studioOverlay) return;
    const contentBtns = studioOverlay.querySelectorAll('.wf-content-btn');
    const widgetBtns = studioOverlay.querySelectorAll('.wf-widget-btn');

    contentBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const contentType = btn.dataset.content;
        if (contentType === 'flows') {
          showFlowPanel();
          return;
        }
        console.log('Content selected:', contentType);
      });
    });

    widgetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const widget = btn.dataset.widget;
        if (widget === 'popup') {
          window.dispatchEvent(new CustomEvent('wf-widget-selected', { detail: { widgetKind: 'popup' } }));
          showPopupTypePanel({ widgetKind: 'popup' });
          return;
        }
        if (widget === 'smart-tip') {
          window.dispatchEvent(new CustomEvent('wf-widget-selected', { detail: { widgetKind: 'smart-tip' } }));
          showPopupTypePanel({ widgetKind: 'smart-tip' });
          return;
        }
        if (widget === 'beacon') {
          window.dispatchEvent(new CustomEvent('wf-widget-selected', { detail: { widgetKind: 'beacon' } }));
          showPopupTypePanel({ widgetKind: 'beacon' });
          return;
        }
        console.log('Widget selected:', widget);
      });
    });
  }

  function showPopupConfigPanel() {
    if (!studioOverlay || !popupEditorState) return;
    const content = studioOverlay.querySelector('.wf-studio-content');
    if (!content) return;

    const st = popupEditorState;
    const widgetKind = st.widgetKind || 'popup';
    const widgetMeta = WF_WIDGET_TYPE_CATALOG[widgetKind] || WF_WIDGET_TYPE_CATALOG.popup;
    const widgetLabel = widgetMeta.label || 'Popup';

    if (popupConfigVisAbort) {
      popupConfigVisAbort.abort();
      popupConfigVisAbort = null;
    }

    const initialAnchorLabel = (st.anchorLabel || '').trim();
    const popupVisState = {
      where: [{ id: 1, showOn: '' }],
      when: [
        {
          id: 1,
          cause: initialAnchorLabel ? 'screen-detection' : '',
          targetLabel: initialAnchorLabel,
          targetSelectValue: '',
          detectionTiming: 'instant'
        }
      ],
      who: [{ id: 1, identifyBy: '' }],
      openWhere: null,
      openWhen: null,
      openWho: null,
      expWhere: false,
      expWhen: false,
      expWho: false,
      whenFrequencyMode: 'set-number',
      whenFrequencyCount: 1
    };
    const popupContentState = {
      title: (st.content && st.content.title) || st.name || 'Popup preview',
      body: (st.content && st.content.body) || 'Add your message here',
      primaryCta: (st.content && st.content.primaryCta) || 'Learn more',
      secondaryCta: (st.content && st.content.secondaryCta) || 'Later',
      tertiaryCta: (st.content && st.content.tertiaryCta) || 'Dismiss',
      style: (st.content && st.content.style) || {}
    };

    function renderPopupVisibilityMount() {
      const mount = content.querySelector('#wf-popup-vis-mount');
      if (mount) mount.innerHTML = buildPopupVisibilityAccordionsHtml(popupVisState);
    }

    const isBeaconConfig = widgetKind === 'beacon';
    const popupConfigCloseXRowHtml = isBeaconConfig
      ? ''
      : `
              <div class="wf-step-toggle-row">
                <span class="wf-step-toggle-label">'x' on the ${wfEscapeHtml(widgetLabel)}</span>
                <label class="wf-step-switch">
                  <input type="checkbox" class="wf-step-switch-input" name="wf-popup-close-x" checked />
                  <span class="wf-step-switch-track" aria-hidden="true"><span class="wf-step-switch-thumb"></span></span>
                </label>
              </div>`;
    const popupConfigBgBlockHtml = isBeaconConfig
      ? `
              <hr class="wf-popup-config-divider" />`
      : `
              <hr class="wf-popup-config-divider" />
              <div class="wf-popup-config-field">
                <span class="wf-popup-config-label">${wfEscapeHtml(widgetLabel)} Background</span>
                <div class="wf-popup-segmented" role="group" aria-label="Background type">
                  <button type="button" class="wf-popup-segment wf-popup-segment--active" data-wf-popup-bg="color">Color</button>
                  <button type="button" class="wf-popup-segment" data-wf-popup-bg="image">Image</button>
                </div>
              </div>
              <div class="wf-popup-config-field wf-popup-config-field--color">
                <span class="wf-popup-config-label">Background color</span>
                <div class="wf-popup-color-row">
                  <span class="wf-popup-color-swatch" aria-hidden="true"></span>
                  <input type="text" class="wf-popup-color-input" value="#FFFFFF" maxlength="7" spellcheck="false" aria-label="Background color hex" />
                </div>
              </div>
              <hr class="wf-popup-config-divider" />`;

    content.innerHTML = `
      <div class="wf-popup-config-panel wf-flow-step-editor-panel">
        <div class="wf-step-editor-chrome wf-popup-config-chrome">
          <div class="wf-popup-config-name-field">
            <div class="wf-flow-name-row">
              <div class="wf-popup-type-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                </svg>
              </div>
              <input type="text" class="wf-flow-name-input wf-popup-name-input" placeholder="Enter ${wfEscapeHtml(widgetLabel)} name" autocomplete="off" aria-describedby="wf-popup-name-error-msg" />
            </div>
            <p class="wf-flow-name-error wf-popup-name-error" id="wf-popup-name-error-msg" role="alert" hidden></p>
          </div>
          <div class="wf-step-editor-tabs" role="tablist" aria-label="${wfEscapeHtml(widgetLabel)} settings">
            <button type="button" class="wf-step-editor-tab active" role="tab" aria-selected="true" data-popup-config-tab="configurations">CONFIGURATIONS</button>
            <button type="button" class="wf-step-editor-tab" role="tab" aria-selected="false" data-popup-config-tab="visibility">VISIBILITY RULES</button>
          </div>
        </div>
        <div class="wf-step-editor-tabpanes">
          <div class="wf-step-editor-tabpanel active" role="tabpanel" data-popup-config-panel="configurations">
            <div class="wf-flow-step-editor-body wf-popup-config-body">
              ${popupConfigCloseXRowHtml}
              <div class="wf-step-toggle-row">
                <span class="wf-step-toggle-label">Don't show me again</span>
                <label class="wf-step-switch">
                  <input type="checkbox" class="wf-step-switch-input" name="wf-popup-dont-show" />
                  <span class="wf-step-switch-track" aria-hidden="true"><span class="wf-step-switch-thumb"></span></span>
                </label>
              </div>
              ${popupConfigBgBlockHtml}
              <div class="wf-step-toggle-row">
                <span class="wf-step-toggle-label wf-popup-config-label-with-hint">
                  Position ${wfEscapeHtml(widgetLabel)}
                  <button type="button" class="wf-popup-info-btn" title="Position the ${wfEscapeHtml(widgetLabel.toLowerCase())} on screen" aria-label="About position">i</button>
                </span>
                <label class="wf-step-switch">
                  <input type="checkbox" class="wf-step-switch-input" name="wf-popup-position" />
                  <span class="wf-step-switch-track" aria-hidden="true"><span class="wf-step-switch-thumb"></span></span>
                </label>
              </div>
            </div>
          </div>
          <div class="wf-step-editor-tabpanel" role="tabpanel" hidden data-popup-config-panel="visibility">
            <div class="wf-flow-step-editor-body wf-popup-config-body wf-popup-vis-tab-body">
              <div id="wf-popup-vis-mount" class="wf-popup-vis-mount"></div>
            </div>
          </div>
        </div>
        <div class="wf-flow-footer wf-popup-config-footer">
          <button type="button" class="wf-flow-discard wf-popup-config-discard">Discard</button>
          <button type="button" class="wf-flow-save wf-popup-config-save">Save ${wfEscapeHtml(widgetLabel)}</button>
        </div>
      </div>
    `;

    const nameInput = content.querySelector('.wf-popup-name-input');
    const nameErr = content.querySelector('.wf-popup-name-error');
    const swatch = content.querySelector('.wf-popup-color-swatch');
    const colorInput = content.querySelector('.wf-popup-color-input');
    const colorField = content.querySelector('.wf-popup-config-field--color');
    function syncSwatch() {
      const v = (colorInput && colorInput.value.trim()) || '#FFFFFF';
      if (swatch && /^#[0-9A-Fa-f]{6}$/.test(v)) swatch.style.background = v;
    }

    function clearNameErr() {
      if (nameErr) {
        nameErr.hidden = true;
        nameErr.textContent = '';
      }
      nameInput?.removeAttribute('aria-invalid');
    }

    function showNameErr(msg) {
      if (nameErr) {
        nameErr.textContent = msg;
        nameErr.hidden = false;
      }
      nameInput?.setAttribute('aria-invalid', 'true');
      nameInput?.focus();
    }

    nameInput?.addEventListener('input', () => {
      if (nameInput.getAttribute('aria-invalid') === 'true') clearNameErr();
    });

    colorInput?.addEventListener('input', syncSwatch);
    syncSwatch();

    if (popupConfigContentSyncHandler) {
      window.removeEventListener('wf-popup-content-updated', popupConfigContentSyncHandler);
      popupConfigContentSyncHandler = null;
    }

    const onCanvasContentUpdated = (e) => {
      const d = e.detail || {};
      if (d.widgetKind && d.widgetKind !== widgetKind) return;
      if (d.typeId !== st.typeId || d.templateId !== st.templateId) return;
      if (d.content && typeof d.content === 'object') {
        popupContentState.title = d.content.title || popupContentState.title;
        popupContentState.body = d.content.body || popupContentState.body;
        popupContentState.primaryCta = d.content.primaryCta || popupContentState.primaryCta;
        popupContentState.secondaryCta = d.content.secondaryCta || popupContentState.secondaryCta;
        popupContentState.tertiaryCta = d.content.tertiaryCta || popupContentState.tertiaryCta;
        if (d.content.style && typeof d.content.style === 'object') {
          popupContentState.style = { ...popupContentState.style, ...d.content.style };
        }
      }
    };
    popupConfigContentSyncHandler = onCanvasContentUpdated;
    window.addEventListener('wf-popup-content-updated', popupConfigContentSyncHandler);

    renderPopupVisibilityMount();
    wirePopupConfigVisibility(content, popupVisState, renderPopupVisibilityMount);

    content.querySelectorAll('[data-popup-config-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-popup-config-tab');
        if (!id) return;
        content.querySelectorAll('[data-popup-config-tab]').forEach((b) => {
          const on = b.getAttribute('data-popup-config-tab') === id;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        content.querySelectorAll('[data-popup-config-panel]').forEach((p) => {
          const on = p.getAttribute('data-popup-config-panel') === id;
          p.classList.toggle('active', on);
          p.hidden = !on;
        });
      });
    });

    content.querySelectorAll('[data-wf-popup-bg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-wf-popup-bg');
        content.querySelectorAll('[data-wf-popup-bg]').forEach((b) => {
          b.classList.toggle('wf-popup-segment--active', b.getAttribute('data-wf-popup-bg') === mode);
        });
        if (colorField) colorField.style.display = mode === 'color' ? '' : 'none';
      });
    });

    content.querySelector('.wf-popup-config-discard')?.addEventListener('click', () => {
      if (popupConfigContentSyncHandler) {
        window.removeEventListener('wf-popup-content-updated', popupConfigContentSyncHandler);
        popupConfigContentSyncHandler = null;
      }
      const resumeId = widgetKind === 'smart-tip' ? null : st.typeId;
      popupEditorState = null;
      showPopupTypePanel({ resumeTypeId: resumeId, widgetKind });
    });

    content.querySelector('.wf-popup-config-save')?.addEventListener('click', () => {
      const trimmed = nameInput ? nameInput.value.trim() : '';
      if (!trimmed) {
        showNameErr(`Please enter a ${widgetLabel.toLowerCase()} name before saving.`);
        return;
      }
      clearNameErr();
      window.dispatchEvent(
        new CustomEvent('wf-popup-saved', {
          detail: {
            name: trimmed,
            widgetKind,
            typeId: st.typeId,
            templateId: st.templateId,
            anchorPosition: st.anchorPosition || null,
            visibility: {
              where: popupVisState.where.map((c) => ({ showOn: c.showOn })),
              when: popupVisState.when.map((c) => ({
                cause: c.cause,
                targetLabel: c.targetLabel || '',
                targetSelectValue: c.targetSelectValue || '',
                detectionTiming: c.detectionTiming || 'instant'
              })),
              whenEnd: {
                frequencyMode: popupVisState.whenFrequencyMode,
                frequencyCount: popupVisState.whenFrequencyCount
              },
              who: popupVisState.who.map((c) => ({ identifyBy: c.identifyBy }))
            },
            content: { ...popupContentState }
          }
        })
      );
      window.dispatchEvent(
        new CustomEvent('wf-widget-saved', {
          detail: {
            name: trimmed,
            widgetKind,
            typeId: st.typeId,
            templateId: st.templateId,
            anchorPosition: st.anchorPosition || null,
            visibility: {
              where: popupVisState.where.map((c) => ({ showOn: c.showOn })),
              when: popupVisState.when.map((c) => ({
                cause: c.cause,
                targetLabel: c.targetLabel || '',
                targetSelectValue: c.targetSelectValue || '',
                detectionTiming: c.detectionTiming || 'instant'
              })),
              whenEnd: {
                frequencyMode: popupVisState.whenFrequencyMode,
                frequencyCount: popupVisState.whenFrequencyCount
              },
              who: popupVisState.who.map((c) => ({ identifyBy: c.identifyBy }))
            },
            content: { ...popupContentState }
          }
        })
      );
      if (popupConfigContentSyncHandler) {
        window.removeEventListener('wf-popup-content-updated', popupConfigContentSyncHandler);
        popupConfigContentSyncHandler = null;
      }
      popupEditorState = null;
      restoreMainStudioContent();
    });
  }

  function showPopupTypePanel(options) {
    const opts = options && typeof options === 'object' ? options : {};
    if (popupConfigVisAbort) {
      popupConfigVisAbort.abort();
      popupConfigVisAbort = null;
    }
    if (popupConfigContentSyncHandler) {
      window.removeEventListener('wf-popup-content-updated', popupConfigContentSyncHandler);
      popupConfigContentSyncHandler = null;
    }
    if (!studioOverlay) return;
    const content = studioOverlay.querySelector('.wf-studio-content');
    const header = studioOverlay.querySelector('.wf-studio-header');
    if (!content || !header) return;

    const widgetKind = opts.widgetKind || (popupEditorState && popupEditorState.widgetKind) || 'popup';
    const widgetMeta = WF_WIDGET_TYPE_CATALOG[widgetKind] || WF_WIDGET_TYPE_CATALOG.popup;
    const widgetLabel = widgetMeta.label || 'Popup';
    const typeLabel = widgetMeta.typeLabel || 'popup type';
    const WIDGET_TYPES = widgetMeta.types || WF_POPUP_TYPES;
    const WIDGET_TEMPLATES = widgetMeta.templates || WF_POPUP_TEMPLATES;

    if (!opts.resumeTypeId) popupEditorState = null;

    header.innerHTML = `
      <button class="wf-header-back-btn" title="Back to studio" aria-label="Back to studio">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
      </button>
      <span class="wf-header-title">${wfEscapeHtml(widgetLabel)}</span>
      <div class="wf-header-controls">
        <button class="wf-control-btn wf-move-btn" title="Move panel to left/right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11,17 6,12 11,7"/>
            <polyline points="13,17 18,12 13,7"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-minimize-btn" title="Minimize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-close-btn" title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    wirePopupStudioHeader();

    let selectedTypeId = opts.resumeTypeId != null ? String(opts.resumeTypeId) : null;

    const WF_MINI_TWO_BTN_TPL = new Set([
      'overlay-3',
      'fullscreen-3',
      'drawer-3',
      'bottomsheet-3',
      'banner-3'
    ]);
    const WF_MINI_THREE_BTN_TPL = new Set(['overlay-4', 'fullscreen-4', 'drawer-4', 'bottomsheet-4']);

    function wfMiniShapeInner(templateId) {
      if (!templateId) return '';
      if (WF_MINI_TWO_BTN_TPL.has(templateId)) {
        return (
          '<span class="wf-popup-mini-actions" data-wf-pills="2" aria-hidden="true">' +
          '<span class="wf-popup-mini-pill"></span><span class="wf-popup-mini-pill"></span></span>'
        );
      }
      if (WF_MINI_THREE_BTN_TPL.has(templateId)) {
        return (
          '<span class="wf-popup-mini-actions" data-wf-pills="3" aria-hidden="true">' +
          '<span class="wf-popup-mini-pill"></span><span class="wf-popup-mini-pill"></span><span class="wf-popup-mini-pill"></span></span>'
        );
      }
      if (templateId === 'fullscreen-5') {
        return '<span class="wf-popup-mini-media" aria-hidden="true"></span>';
      }
      if (templateId === 'drawer-4') {
        return '<span class="wf-popup-mini-drawer-head2" aria-hidden="true"></span>';
      }
      if (templateId === 'drawer-5') {
        return (
          '<span class="wf-popup-mini-scroll-lines" aria-hidden="true"><span></span><span></span><span></span></span>'
        );
      }
      if (templateId === 'bottomsheet-5') {
        return (
          '<span class="wf-popup-mini-list" aria-hidden="true">' +
          '<span></span><span></span><span></span></span>'
        );
      }
      if (templateId === 'snackbar-4') {
        return '<span class="wf-popup-mini-snack-icon" aria-hidden="true"></span>';
      }
      if (templateId === 'banner-4') {
        return '<span class="wf-popup-mini-banner-icon" aria-hidden="true"></span>';
      }
      if (templateId === 'banner-5') {
        return '<span class="wf-popup-mini-dismiss" aria-hidden="true">×</span>';
      }
      if (templateId === 'carousel-4' || templateId === 'carousel-5') {
        return '<span class="wf-popup-mini-dots" aria-hidden="true"><span></span><span></span><span></span></span>';
      }
      return '';
    }

    function wfMiniTypeInner(widgetKind, typeId) {
      if (!widgetKind || !typeId) return '';
      if (widgetKind === 'beacon') {
        if (typeId === 'pulse') return '<span class="wf-popup-mini-beacon wf-popup-mini-beacon--pulse" aria-hidden="true"></span>';
        if (typeId === 'ring') return '<span class="wf-popup-mini-beacon wf-popup-mini-beacon--ring" aria-hidden="true"></span>';
        if (typeId === 'dot') return '<span class="wf-popup-mini-beacon wf-popup-mini-beacon--dot" aria-hidden="true"></span>';
        if (typeId === 'badge') return '<span class="wf-popup-mini-beacon wf-popup-mini-beacon--badge" aria-hidden="true"></span>';
        if (typeId === 'spotlight') return '<span class="wf-popup-mini-beacon wf-popup-mini-beacon--spotlight" aria-hidden="true"></span>';
        if (typeId === 'nudge') return '<span class="wf-popup-mini-beacon wf-popup-mini-beacon--nudge" aria-hidden="true"></span>';
      }
      if (widgetKind === 'smart-tip') {
        if (typeId === 'anchored') {
          return (
            '<span class="wf-popup-mini-smart-tip wf-popup-mini-smart-tip--anchored" aria-hidden="true">' +
            '<span class="wf-popup-mini-st-bubble"></span>' +
            '<span class="wf-popup-mini-st-anchor"></span>' +
            '</span>'
          );
        }
        if (typeId === 'inline') return '<span class="wf-popup-mini-smart-tip wf-popup-mini-smart-tip--inline" aria-hidden="true"></span>';
        if (typeId === 'tooltip') {
          return (
            '<span class="wf-popup-mini-smart-tip wf-popup-mini-smart-tip--tooltip" aria-hidden="true">' +
            '<span class="wf-popup-mini-st-bubble"></span>' +
            '<span class="wf-popup-mini-st-caret"></span>' +
            '<span class="wf-popup-mini-st-target"></span>' +
            '</span>'
          );
        }
      }
      return '';
    }

    function renderMiniPhone(layout, extraCarousel, templateId, widgetKind, typeId) {
      const useBlankTypeChrome = !templateId && (widgetKind === 'smart-tip' || widgetKind === 'beacon');
      const layoutClass = useBlankTypeChrome ? 'blank' : layout;
      let carouselExtras = '';
      if (layoutClass === 'carousel' && extraCarousel) {
        const backCount = templateId === 'carousel-3' ? 3 : 2;
        carouselExtras = Array.from({ length: backCount }, () => '<span class="wf-popup-mini-card-back" aria-hidden="true"></span>').join(
          ''
        );
      }
      const safeTpl =
        templateId && /^[a-z0-9-]+$/i.test(templateId) ? String(templateId).toLowerCase() : '';
      const tplClass = safeTpl ? ` wf-popup-mini-tpl--${safeTpl}` : '';
      const shapeInner = safeTpl ? wfMiniShapeInner(safeTpl) : wfMiniTypeInner(widgetKind, typeId);
      return (
        `<span class="wf-popup-mini-phone wf-popup-mini--${wfEscapeHtml(layoutClass)}${tplClass}" aria-hidden="true">` +
        carouselExtras +
        `<span class="wf-popup-mini-shape">${shapeInner}</span></span>`
      );
    }

    function applyWidgetTemplateChoice(typeId, templateId) {
      if (!typeId || !templateId) return;
      window.dispatchEvent(
        new CustomEvent('wf-popup-template-selected', {
          detail: { widgetKind, typeId, templateId }
        })
      );
      window.dispatchEvent(
        new CustomEvent('wf-widget-template-selected', {
          detail: { widgetKind, typeId, templateId }
        })
      );
      popupEditorState = {
        widgetKind,
        typeId,
        templateId,
        content: {
          title: `${widgetLabel} preview`,
          body: `Template: ${templateId}`,
          primaryCta: 'Learn more',
          secondaryCta: 'Later',
          tertiaryCta: 'Dismiss'
        }
      };
      showPopupConfigPanel();
    }

    function showSmartTipAnchorPanel(typeId, templateId) {
      const safeTypeId = String(typeId || 'anchored');
      const safeTemplateId = String(templateId || `${safeTypeId}-1`);
      const icon = safeTypeId === 'inline' ? '≡' : safeTypeId === 'tooltip' ? '⟡' : '💬';
      content.innerHTML =
        `<div class="wf-smart-tip-anchor-panel">` +
        `<div class="wf-smart-tip-anchor-top">` +
        `<div class="wf-smart-tip-anchor-icon" aria-hidden="true">${icon}</div>` +
        `<input type="text" class="wf-smart-tip-anchor-input" value="testing smart tips" aria-label="Smart tip text" />` +
        `</div>` +
        `<button type="button" class="wf-smart-tip-details-btn">Details</button>` +
        `<button type="button" class="wf-smart-tip-add-help">` +
        `<span class="wf-smart-tip-add-help-plus" aria-hidden="true">+</span>` +
        `<span>Add Help Tip</span>` +
        `<span class="wf-smart-tip-add-help-caret" aria-hidden="true">⌄</span>` +
        `</button>` +
        `<div class="wf-smart-tip-anchor-actions">` +
        `<button type="button" class="wf-smart-tip-discard">Discard</button>` +
        `<div class="wf-smart-tip-anchor-actions-right">` +
        `<button type="button" class="wf-smart-tip-cancel">Cancel</button>` +
        `<button type="button" class="wf-smart-tip-save">Save Tip</button>` +
        `</div>` +
        `</div>` +
        `</div>`;

      const backToTypes = () => showPopupTypePanel({ widgetKind: 'smart-tip' });
      content.querySelector('.wf-smart-tip-discard')?.addEventListener('click', backToTypes);
      content.querySelector('.wf-smart-tip-cancel')?.addEventListener('click', backToTypes);
      content.querySelector('.wf-smart-tip-save')?.addEventListener('click', backToTypes);
      
      // Details button handler - opens same UI as Flow Details
      content.querySelector('.wf-smart-tip-details-btn')?.addEventListener('click', () => {
        const textValue = (content.querySelector('.wf-smart-tip-anchor-input')?.value || '').trim();
        popupEditorState = {
          widgetKind: 'smart-tip',
          typeId: safeTypeId,
          templateId: safeTemplateId,
          name: textValue || 'Smart Tip',
          content: {
            title: textValue || 'Smart Tip',
            body: `Template: ${safeTemplateId}`,
            primaryCta: 'Learn more',
            secondaryCta: 'Later',
            tertiaryCta: 'Dismiss'
          }
        };
        showWidgetDetailsPanel('Smart Tip', () => showSmartTipAnchorPanel(safeTypeId, safeTemplateId));
      });
      
      content.querySelector('.wf-smart-tip-add-help')?.addEventListener('click', () => {
        const textValue = (content.querySelector('.wf-smart-tip-anchor-input')?.value || '').trim();
        smartTipAnchorPickBridge = {
          widgetKind: 'smart-tip',
          typeId: safeTypeId,
          templateId: safeTemplateId,
          textValue: textValue || 'Smart tip'
        };
        startFlowStepSelectMode({
          mode: 'smartTipAnchor',
          minibarTitle: 'Select element to anchor smart tip'
        });
      });
    }

    function showBeaconAnchorPanel(typeId, templateId) {
      const safeTypeId = String(typeId || 'pulse');
      const safeTemplateId = String(templateId || `${safeTypeId}-1`);
      content.innerHTML =
        `<div class="wf-smart-tip-anchor-panel">` +
        `<div class="wf-smart-tip-anchor-top">` +
        `<div class="wf-smart-tip-anchor-icon" aria-hidden="true">◎</div>` +
        `<input type="text" class="wf-smart-tip-anchor-input" value="testing beacon" aria-label="Beacon title" />` +
        `</div>` +
        `<button type="button" class="wf-smart-tip-details-btn">Details</button>` +
        `<button type="button" class="wf-smart-tip-add-help">` +
        `<span class="wf-smart-tip-add-help-plus" aria-hidden="true">+</span>` +
        `<span>Add Beacon</span>` +
        `<span class="wf-smart-tip-add-help-caret" aria-hidden="true">⌄</span>` +
        `</button>` +
        `<div class="wf-smart-tip-anchor-actions">` +
        `<button type="button" class="wf-smart-tip-discard">Discard</button>` +
        `<div class="wf-smart-tip-anchor-actions-right">` +
        `<button type="button" class="wf-smart-tip-cancel">Cancel</button>` +
        `<button type="button" class="wf-smart-tip-save">Save Beacon</button>` +
        `</div>` +
        `</div>` +
        `</div>`;

      const backToTypes = () => showPopupTypePanel({ widgetKind: 'beacon' });
      content.querySelector('.wf-smart-tip-discard')?.addEventListener('click', backToTypes);
      content.querySelector('.wf-smart-tip-cancel')?.addEventListener('click', backToTypes);
      content.querySelector('.wf-smart-tip-save')?.addEventListener('click', backToTypes);
      
      // Details button handler - opens same UI as Flow Details
      content.querySelector('.wf-smart-tip-details-btn')?.addEventListener('click', () => {
        const textValue = (content.querySelector('.wf-smart-tip-anchor-input')?.value || '').trim();
        popupEditorState = {
          widgetKind: 'beacon',
          typeId: safeTypeId,
          templateId: safeTemplateId,
          name: textValue || 'Beacon',
          content: {
            title: textValue || 'Beacon',
            body: `Template: ${safeTemplateId}`,
            primaryCta: 'Learn more',
            secondaryCta: 'Later',
            tertiaryCta: 'Dismiss'
          }
        };
        showWidgetDetailsPanel('Beacon', () => showBeaconAnchorPanel(safeTypeId, safeTemplateId));
      });
      
      content.querySelector('.wf-smart-tip-add-help')?.addEventListener('click', () => {
        const textValue = (content.querySelector('.wf-smart-tip-anchor-input')?.value || '').trim();
        beaconAnchorPickBridge = {
          widgetKind: 'beacon',
          typeId: safeTypeId || 'pulse',
          templateId: safeTemplateId,
          textValue: textValue || 'Beacon'
        };
        startFlowStepSelectMode({
          mode: 'beaconAnchor',
          minibarTitle: 'Select element to latch beacon'
        });
      });
    }

    function render() {
      const titleText = selectedTypeId ? 'Choose template' : `Choose ${typeLabel}`;

      const innerHeaderHtml = selectedTypeId
        ? `<div class="wf-popup-picker-header">` +
          `<button type="button" class="wf-popup-picker-back" aria-label="Back to popup types" title="Back">` +
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"/></svg>` +
          `</button>` +
          `<div class="wf-popup-picker-heading">` +
          `<h2 class="wf-popup-picker-title">${wfEscapeHtml(titleText)}</h2>` +
          `</div>` +
          `</div>`
        : `<div class="wf-popup-picker-header wf-popup-picker-header--no-back">` +
          `<div class="wf-popup-picker-heading">` +
          `<h2 class="wf-popup-picker-title wf-popup-picker-title--root">${wfEscapeHtml(titleText)}</h2>` +
          `</div>` +
          `</div>`;

      let gridHtml = '';
      if (selectedTypeId && WIDGET_TEMPLATES[selectedTypeId] && widgetKind !== 'smart-tip') {
        const typeRow = WIDGET_TYPES.find((t) => t.id === selectedTypeId);
        const layout = typeRow ? typeRow.layout : 'center';
        gridHtml = WIDGET_TEMPLATES[selectedTypeId]
          .map((tm) => {
            return (
              `<button type="button" class="wf-popup-picker-card" data-wf-popup-template="${wfEscapeHtml(selectedTypeId)}" data-wf-popup-template-id="${wfEscapeHtml(tm.id)}">` +
              `<div class="wf-popup-picker-card-preview">${renderMiniPhone(layout, true, tm.id, widgetKind, selectedTypeId)}</div>` +
              `<span class="wf-popup-picker-card-name">${wfEscapeHtml(tm.name)}</span>` +
              `</button>`
            );
          })
          .join('');
      } else {
        gridHtml = WIDGET_TYPES.map((t) => {
          return (
            `<button type="button" class="wf-popup-picker-card" data-wf-popup-type="${wfEscapeHtml(t.id)}">` +
            `<div class="wf-popup-picker-card-preview">${renderMiniPhone(t.layout, true, null, widgetKind, t.id)}</div>` +
            `<span class="wf-popup-picker-card-name">${wfEscapeHtml(t.title)}</span>` +
            `</button>`
          );
        }).join('');
      }

      content.innerHTML =
        `<div class="wf-popup-picker">` +
        innerHeaderHtml +
        `<div class="wf-popup-picker-scroll">` +
        `<div class="wf-popup-picker-grid">${gridHtml}</div>` +
        `</div>` +
        `</div>`;

      content.querySelector('.wf-popup-picker-back')?.addEventListener('click', () => {
        selectedTypeId = null;
        render();
      });

      content.querySelectorAll('[data-wf-popup-type]').forEach((card) => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-wf-popup-type');
          if (!id) return;
          if (widgetKind === 'smart-tip') {
            const list = WIDGET_TEMPLATES[id];
            const first = list && list[0];
            if (first && first.id) showSmartTipAnchorPanel(id, first.id);
            return;
          }
          if (widgetKind === 'beacon') {
            const list = WIDGET_TEMPLATES[id];
            const first = list && list[0];
            if (first && first.id) showBeaconAnchorPanel(id, first.id);
            return;
          }
          selectedTypeId = id;
          render();
        });
      });

      content.querySelectorAll('[data-wf-popup-template]').forEach((card) => {
        card.addEventListener('click', () => {
          const typeId = card.getAttribute('data-wf-popup-template');
          const templateId = card.getAttribute('data-wf-popup-template-id');
          if (!typeId || !templateId) return;
          applyWidgetTemplateChoice(typeId, templateId);
        });
      });
    }

    render();
  }

  const WF_FLOW_WIDGET_OPTIONS = [
    {
      id: 'popups',
      label: 'Popups',
      description: 'Centered dialog over the app—great for confirmations and short messages.'
    },
    {
      id: 'bottom-sheet',
      label: 'Bottom sheet',
      description: 'Slides up from the bottom; ideal for actions, lists, and extra context.'
    },
    {
      id: 'drawers',
      label: 'Drawers',
      description: 'Side panel that slides in—useful for navigation, filters, or settings.'
    },
    {
      id: 'tooltip',
      label: 'Tooltip',
      description: 'Compact callout anchored to an element with optional steps.'
    },
    {
      id: 'beacon',
      label: 'Beacon',
      description: 'Pulsing hotspot that draws attention without blocking the UI.'
    }
  ];

  function wfFlowWidgetOptionLabel(id) {
    const o = WF_FLOW_WIDGET_OPTIONS.find((x) => x.id === id);
    return o ? o.label : 'Tooltip';
  }

  function closeWfFlowWidgetPicker() {
    if (!studioOverlay) return;
    studioOverlay.querySelector('.wf-widget-chooser-inline')?.remove();
    studioOverlay.querySelectorAll('.wf-flow-step-editor-body--widget-picker').forEach((el) => {
      el.classList.remove('wf-flow-step-editor-body--widget-picker');
    });
  }

  function openWfFlowWidgetPicker(stepsArr, stepIdx, labelEl) {
    if (!studioOverlay) return;
    closeWfFlowWidgetPicker();
    const step = stepsArr[stepIdx];
    if (!step) return;
    if (!step.appearanceWidget) step.appearanceWidget = 'tooltip';

    const contentRoot = studioOverlay.querySelector('.wf-studio-content');
    if (contentRoot) {
      contentRoot.querySelectorAll('[data-step-editor-tab]').forEach((b) => {
        const on = b.getAttribute('data-step-editor-tab') === 'configurations';
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      contentRoot.querySelectorAll('[data-step-editor-tabpanel]').forEach((p) => {
        const on = p.getAttribute('data-step-editor-tabpanel') === 'configurations';
        p.classList.toggle('active', on);
        p.hidden = !on;
      });
    }

    const tabPanel = studioOverlay.querySelector(
      '.wf-step-editor-tabpanel[data-step-editor-tabpanel="configurations"]'
    );
    const body = tabPanel && tabPanel.querySelector('.wf-flow-step-editor-body');
    if (!body) return;

    body.classList.add('wf-flow-step-editor-body--widget-picker');

    const itemsHtml = WF_FLOW_WIDGET_OPTIONS.map((o) => {
      const sel = step.appearanceWidget === o.id ? ' wf-widget-chooser-card--selected' : '';
      const thumbClass = 'wf-widget-chooser-thumb--' + o.id.replace(/[^a-z0-9-]/gi, '');
      return (
        '<li>' +
        `<button type="button" class="wf-widget-chooser-card${sel}" data-widget-id="${wfEscapeHtml(o.id)}">` +
        `<span class="wf-widget-chooser-thumb ${thumbClass}" aria-hidden="true"></span>` +
        '<span class="wf-widget-chooser-copy">' +
        `<span class="wf-widget-chooser-name">${wfEscapeHtml(o.label)}</span>` +
        `<span class="wf-widget-chooser-desc">${wfEscapeHtml(o.description)}</span>` +
        '</span>' +
        '</button></li>'
      );
    }).join('');

    const wrap = document.createElement('div');
    wrap.className = 'wf-widget-chooser-inline';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'wf-widget-chooser-title');
    wrap.innerHTML =
      '<div class="wf-widget-chooser-header">' +
      '<button type="button" class="wf-widget-chooser-back" aria-label="Back">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg>' +
      '</button>' +
      '<h2 class="wf-widget-chooser-title" id="wf-widget-chooser-title">Choose widget</h2>' +
      '</div>' +
      `<ul class="wf-widget-chooser-list">${itemsHtml}</ul>`;

    body.insertBefore(wrap, body.firstChild);

    const finish = () => {
      document.removeEventListener('keydown', onKey);
      closeWfFlowWidgetPicker();
    };
    function onKey(e) {
      if (e.key === 'Escape') finish();
    }
    document.addEventListener('keydown', onKey);

    wrap.querySelector('.wf-widget-chooser-back')?.addEventListener('click', finish);
    wrap.querySelectorAll('.wf-widget-chooser-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-widget-id');
        if (id) step.appearanceWidget = id;
        if (labelEl) labelEl.textContent = wfFlowWidgetOptionLabel(step.appearanceWidget);
        finish();
      });
    });
  }

  /**
   * @param {object} [options]
   * @param {boolean} [options.timeline] - Force timeline (true) or simple (false) layout
   */
  function showFlowPanel(options) {
    const opts = options && typeof options === 'object' ? options : {};
    if (opts.timeline === true) {
      flowEditorState.hasTimelineUi = true;
    }
    if (opts.timeline === false) {
      flowEditorState.hasTimelineUi = false;
    }

    const useTimeline = flowEditorState.hasTimelineUi;
    const steps = flowEditorState.flowSteps;
    const stepCountLabel = steps.length === 1 ? '1 Step' : `${steps.length} Steps`;

    const stepMenuSvg = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="5" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="12" cy="19" r="2"/>
                    </svg>`;

    const stepCardsHtml = steps
      .map((step, index) => {
        const n = index + 1;
        const safeId = wfEscapeHtml(step.id);
        const safeLabel = wfEscapeHtml(step.label);
        return `
                <div class="wf-flow-step-card wf-flow-step-card--interactive" data-flow-step-open="${safeId}" data-flow-step-id="${safeId}">
                  <span class="wf-flow-step-badge">${n}</span>
                  <span class="wf-flow-step-text">${safeLabel}</span>
                  <button type="button" class="wf-flow-step-menu" data-flow-step-remove="${safeId}" aria-label="Remove step">
                    ${stepMenuSvg}
                  </button>
                </div>`;
      })
      .join('');

    const content = studioOverlay.querySelector('.wf-studio-content');
    const header = studioOverlay.querySelector('.wf-studio-header');

    header.innerHTML = `
      <button class="wf-header-back-btn" title="Back to studio">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
      </button>
      <span class="wf-header-title">Flow</span>
      <div class="wf-header-controls">
        <button class="wf-control-btn wf-move-btn" title="Move panel to left/right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11,17 6,12 11,7"/>
            <polyline points="13,17 18,12 13,7"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-minimize-btn" title="Minimize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-close-btn" title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    const backBtn = header.querySelector('.wf-header-back-btn');
    const closeBtn = header.querySelector('.wf-close-btn');
    const minimizeBtn = header.querySelector('.wf-minimize-btn');
    const moveBtn = header.querySelector('.wf-move-btn');

    backBtn?.addEventListener('click', () => resetToMainView());
    closeBtn?.addEventListener('click', () => toggleStudio(false));
    minimizeBtn?.addEventListener('click', () => studioOverlay.classList.toggle('wf-minimized'));
    moveBtn?.addEventListener('click', () => togglePanelSide());

    const simpleBody = `
        <div class="wf-flow-body wf-flow-body--simple">
          <div class="wf-flow-name-field">
            <div class="wf-flow-name-row">
              <div class="wf-flow-type-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="4" x2="12" y2="20"/>
                  <path d="M12 6h8l-2 3H12V6z"/>
                  <path d="M12 12H4l2 3h6v-3z"/>
                </svg>
              </div>
              <input type="text" class="wf-flow-name-input" placeholder="Enter Flow Name" autocomplete="off" aria-describedby="wf-flow-name-error-msg" />
            </div>
            <p class="wf-flow-name-error" id="wf-flow-name-error-msg" role="alert" hidden></p>
          </div>
          <button type="button" class="wf-flow-details-btn">Details</button>
          <button type="button" class="wf-flow-add-step wf-flow-add-steps-cta">
            <span class="wf-flow-add-step-plus">+</span>
            Add flow steps
          </button>
        </div>
        <div class="wf-flow-footer">
          <button type="button" class="wf-flow-discard">Discard</button>
          <div class="wf-flow-footer-actions">
            <button type="button" class="wf-flow-preview">Preview</button>
            <button type="button" class="wf-flow-save">Save Flow</button>
          </div>
        </div>`;

    const timelineBody = `
        <div class="wf-flow-body">
          <div class="wf-flow-name-field">
            <div class="wf-flow-name-row">
              <div class="wf-flow-type-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="4" x2="12" y2="20"/>
                  <path d="M12 6h8l-2 3H12V6z"/>
                  <path d="M12 12H4l2 3h6v-3z"/>
                </svg>
              </div>
              <input type="text" class="wf-flow-name-input" placeholder="Enter Flow Name" autocomplete="off" aria-describedby="wf-flow-name-error-msg" />
            </div>
            <p class="wf-flow-name-error" id="wf-flow-name-error-msg" role="alert" hidden></p>
          </div>
          <button type="button" class="wf-flow-details-btn">Details</button>

          <div class="wf-flow-steps-wrap">
            <div class="wf-flow-step-count">${wfEscapeHtml(stepCountLabel)}</div>
            <div class="wf-flow-timeline">
              <div class="wf-flow-timeline-nodes">
                ${stepCardsHtml}
                <button type="button" class="wf-flow-add-step wf-flow-timeline-add-step">
                  <span class="wf-flow-add-step-plus">+</span>
                  Add Step
                </button>
                <div class="wf-flow-step-card">
                  <span class="wf-flow-step-badge wf-flow-step-badge--icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                      <line x1="4" y1="22" x2="4" y2="15"/>
                    </svg>
                  </span>
                  <span class="wf-flow-step-text">End Message</span>
                  <button type="button" class="wf-flow-step-menu" aria-label="End message options">
                    ${stepMenuSvg}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="wf-flow-footer">
          <button type="button" class="wf-flow-discard">Discard</button>
          <div class="wf-flow-footer-actions">
            <button type="button" class="wf-flow-preview">Preview</button>
            <button type="button" class="wf-flow-save">Save Flow</button>
          </div>
        </div>`;

    content.innerHTML = `
      <div class="wf-flow-panel">
        ${useTimeline ? timelineBody : simpleBody}
      </div>
    `;

    const nameInput = content.querySelector('.wf-flow-name-input');
    const nameErrorEl = content.querySelector('.wf-flow-name-error');
    if (nameInput) nameInput.value = flowEditorState.name;

    function clearFlowNameError() {
      if (nameErrorEl) {
        nameErrorEl.hidden = true;
        nameErrorEl.textContent = '';
      }
      nameInput?.removeAttribute('aria-invalid');
    }

    function showFlowNameError(message) {
      if (nameErrorEl) {
        nameErrorEl.textContent = message;
        nameErrorEl.hidden = false;
      }
      nameInput?.setAttribute('aria-invalid', 'true');
      nameInput?.focus();
    }

    nameInput?.addEventListener('input', () => {
      if (nameInput.getAttribute('aria-invalid') === 'true') clearFlowNameError();
    });

    content.querySelector('.wf-flow-details-btn')?.addEventListener('click', () => {
      flowEditorState.name = nameInput ? nameInput.value : flowEditorState.name;
      showFlowDetailsPanel();
    });

    content.querySelector('.wf-flow-add-steps-cta')?.addEventListener('click', () => {
      flowEditorState.name = nameInput ? nameInput.value : flowEditorState.name;
      startFlowStepSelectMode();
    });

    content.querySelector('.wf-flow-timeline-add-step')?.addEventListener('click', () => {
      flowEditorState.name = nameInput ? nameInput.value : flowEditorState.name;
      startFlowStepSelectMode();
    });

    content.querySelectorAll('[data-flow-step-remove]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-flow-step-remove');
        if (!id) return;
        flowEditorState.flowSteps = flowEditorState.flowSteps.filter((s) => s.id !== id);
        flowEditorState.name = nameInput ? nameInput.value : flowEditorState.name;
        showFlowPanel({ timeline: true });
      });
    });

    content.querySelectorAll('[data-flow-step-open]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.wf-flow-step-menu')) return;
        const id = card.getAttribute('data-flow-step-open');
        if (id) showFlowStepEditorPanel(id);
      });
    });

    content.querySelector('.wf-flow-discard')?.addEventListener('click', () => {
      resetToMainView();
    });

    content.querySelector('.wf-flow-save')?.addEventListener('click', () => {
      const trimmed = nameInput ? nameInput.value.trim() : '';
      if (!trimmed) {
        showFlowNameError('Please enter a flow name before saving.');
        return;
      }
      clearFlowNameError();
      flowEditorState.name = trimmed;
      if (nameInput) nameInput.value = trimmed;
      openFlowSavedModal();
    });
  }

  const WF_STEP_MANUAL_COMPLETION_RULES = [
    'On click of "Next" button',
    'On click of selected element',
    'On hovering over selected element',
    'On page refresh (in case of change in URL)',
    'On typing text',
    'On selection change'
  ];

  const WF_STEP_AUTOMATED_COMPLETION_RULES = [
    'Auto Click',
    'Auto Hover',
    'Auto Input',
    'Auto Select'
  ];

  function fillStepCompletionRuleSelect(selectEl, manualSelected) {
    if (!selectEl) return;
    const list = manualSelected ? WF_STEP_MANUAL_COMPLETION_RULES : WF_STEP_AUTOMATED_COMPLETION_RULES;
    const defaultIdx = manualSelected ? 1 : 0;
    selectEl.innerHTML = '';
    list.forEach((text, i) => {
      const o = document.createElement('option');
      o.value = text;
      o.textContent = text;
      if (i === defaultIdx) o.selected = true;
      selectEl.appendChild(o);
    });
  }

  /**
   * @param {string} stepId
   * @param {{ openAdvancedTab?: boolean }} [panelOpts] - After display-rule pick/cancel, keep Advanced Options visible.
   */
  function showFlowStepEditorPanel(stepId, panelOpts) {
    const po = panelOpts && typeof panelOpts === 'object' ? panelOpts : {};
    const openAdvancedTab = !!po.openAdvancedTab;

    const steps = flowEditorState.flowSteps;
    const idx = steps.findIndex((s) => s.id === stepId);
    if (idx < 0) return;

    const stepNumber = idx + 1;
    const totalWithEnd = steps.length + 1;
    const step = steps[idx];
    const previewPrimary = wfEscapeHtml(step.label);
    const titleText = `Creating Step ${stepNumber}`;
    const tooltipPosition = step.tooltipPosition || 'bottom-center';
    const appearanceWidget = step.appearanceWidget || 'tooltip';
    const appearanceWidgetLabel = wfFlowWidgetOptionLabel(appearanceWidget);

    function renderPosOpt(key, beakDir, ariaLabel) {
      const sel = tooltipPosition === key;
      const selClass = sel ? ' wf-step-pos-opt--selected' : '';
      return `<button type="button" class="wf-step-pos-opt wf-step-pos-opt--beak-${beakDir}${selClass}" data-step-position="${key}" aria-pressed="${sel ? 'true' : 'false'}" aria-label="${wfEscapeHtml(ariaLabel)}"></button>`;
    }

    const positionPickerHtml = `
      <div class="wf-step-pos-picker">
        <div class="wf-step-pos-row wf-step-pos-row--top">
          ${renderPosOpt('top-left', 'down', 'Tooltip above, left')}
          ${renderPosOpt('top-center', 'down', 'Tooltip above, center')}
          ${renderPosOpt('top-right', 'down', 'Tooltip above, right')}
        </div>
        <div class="wf-step-pos-middle">
          <div class="wf-step-pos-col">
            ${renderPosOpt('left-top', 'right', 'Tooltip left, top')}
            ${renderPosOpt('left-center', 'right', 'Tooltip left, center')}
            ${renderPosOpt('left-bottom', 'right', 'Tooltip left, bottom')}
          </div>
          <div class="wf-step-pos-target" aria-hidden="true">SELECTED<br/>ELEMENTS</div>
          <div class="wf-step-pos-col">
            ${renderPosOpt('right-top', 'left', 'Tooltip right, top')}
            ${renderPosOpt('right-center', 'left', 'Tooltip right, center')}
            ${renderPosOpt('right-bottom', 'left', 'Tooltip right, bottom')}
          </div>
        </div>
        <div class="wf-step-pos-row wf-step-pos-row--bottom">
          ${renderPosOpt('bottom-left', 'up', 'Tooltip below, left')}
          ${renderPosOpt('bottom-center', 'up', 'Tooltip below, center')}
          ${renderPosOpt('bottom-right', 'up', 'Tooltip below, right')}
        </div>
      </div>`;

    const content = studioOverlay.querySelector('.wf-studio-content');
    const header = studioOverlay.querySelector('.wf-studio-header');

    header.innerHTML = `
      <button class="wf-header-back-btn" title="Back to flow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
      </button>
      <span class="wf-header-title wf-step-editor-header-title">${wfEscapeHtml(titleText)}</span>
      <div class="wf-header-controls">
        <button class="wf-control-btn wf-collapse-btn" title="Collapse">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11,17 6,12 11,7"/>
            <polyline points="18,17 13,12 18,7"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-minimize-btn" title="Minimize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-close-btn" title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    const backFlow = () => showFlowPanel({ timeline: true });

    header.querySelector('.wf-header-back-btn')?.addEventListener('click', backFlow);
    header.querySelector('.wf-close-btn')?.addEventListener('click', () => toggleStudio(false));
    header.querySelector('.wf-minimize-btn')?.addEventListener('click', () => studioOverlay.classList.toggle('wf-minimized'));
    header.querySelector('.wf-collapse-btn')?.addEventListener('click', () => studioOverlay.classList.toggle('wf-collapsed'));

    content.innerHTML = `
      <div class="wf-flow-step-editor-panel">
        <div class="wf-step-editor-chrome">
          <button type="button" class="wf-step-reselect-cta">
            <svg class="wf-step-reselect-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 21h5v-5"/>
            </svg>
            <span>Reselect element</span>
          </button>
          <div class="wf-step-editor-tabs" role="tablist" aria-label="Step settings">
            <button type="button" class="wf-step-editor-tab active" role="tab" aria-selected="true" id="wf-tab-step-config" data-step-editor-tab="configurations">Configurations</button>
            <button type="button" class="wf-step-editor-tab" role="tab" aria-selected="false" id="wf-tab-step-advanced" data-step-editor-tab="advanced">Advanced Options</button>
          </div>
        </div>
        <div class="wf-step-editor-tabpanes">
          <div class="wf-step-editor-tabpanel active" role="tabpanel" aria-labelledby="wf-tab-step-config" data-step-editor-tabpanel="configurations">
            <div class="wf-flow-step-editor-body">
              <section class="wf-step-accordion wf-step-accordion--open" data-step-accordion>
                <button type="button" class="wf-step-accordion-trigger" aria-expanded="true">
                  <span>Appearance</span>
                  <svg class="wf-step-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
                </button>
                <div class="wf-step-accordion-panel">
                  <div class="wf-step-appearance-tooltip-header">
                    <span class="wf-step-appearance-tooltip-label">${wfEscapeHtml(appearanceWidgetLabel)}</span>
                    <button type="button" class="wf-step-appearance-change-widget" data-wf-open-widget-picker="1">Change widget</button>
                  </div>
                  <div class="wf-step-tooltip-preview-wrap">
                    <div class="wf-step-tooltip-mock" aria-hidden="true">
                      <div class="wf-step-tooltip-mock-pointer"></div>
                      <div class="wf-step-tooltip-mock-inner">
                        <div class="wf-step-tooltip-mock-top">
                          <span class="wf-step-tooltip-mock-stepnum">${stepNumber}/${totalWithEnd}</span>
                          <button type="button" class="wf-step-tooltip-mock-close" tabindex="-1" aria-hidden="true">×</button>
                        </div>
                        <p class="wf-step-tooltip-mock-desc">${previewPrimary}</p>
                        <p class="wf-step-tooltip-mock-note">Optional note section</p>
                        <div class="wf-step-tooltip-mock-actions">
                          <button type="button" class="wf-step-tooltip-mock-next" tabindex="-1">Next</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="wf-step-color-row">
                    <span class="wf-step-color-label">Color</span>
                    <span class="wf-step-color-swatch wf-step-color-swatch--fill" title="Tooltip color"></span>
                  </div>
                  <div class="wf-step-color-row">
                    <span class="wf-step-color-label">Close (X) color</span>
                    <span class="wf-step-color-swatch wf-step-color-swatch--close" title="Close control color"></span>
                  </div>
                </div>
              </section>

              <section class="wf-step-accordion" data-step-accordion>
                <button type="button" class="wf-step-accordion-trigger" aria-expanded="false">
                  <span>Position</span>
                  <svg class="wf-step-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
                </button>
                <div class="wf-step-accordion-panel">
                  ${positionPickerHtml}
                </div>
              </section>

              <section class="wf-step-accordion wf-step-accordion--open" data-step-accordion>
                <button type="button" class="wf-step-accordion-trigger" aria-expanded="true">
                  <span>Step Completion Rules</span>
                  <svg class="wf-step-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
                </button>
                <div class="wf-step-accordion-panel">
                  <div class="wf-step-rules-radios" role="radiogroup" aria-label="Completion type">
                    <label class="wf-step-rules-radio">
                      <input type="radio" name="wf-step-completion-type" value="manual" checked />
                      <span>Manual</span>
                    </label>
                    <label class="wf-step-rules-radio">
                      <input type="radio" name="wf-step-completion-type" value="automated" />
                      <span>Automated</span>
                    </label>
                  </div>
                  <div class="wf-step-rules-field">
                    <label class="wf-step-rules-dropdown-label" for="wf-step-completion-rule">Step Completion Rule :</label>
                    <select id="wf-step-completion-rule" class="wf-step-rules-select"></select>
                  </div>
                  <button type="button" class="wf-step-rules-add">+ Add Rule</button>
                </div>
              </section>
            </div>
          </div>
          <div class="wf-step-editor-tabpanel" role="tabpanel" aria-labelledby="wf-tab-step-advanced" data-step-editor-tabpanel="advanced" hidden>
            <div class="wf-flow-step-editor-body wf-flow-step-editor-body--advanced">
              <section class="wf-step-accordion wf-step-accordion--open" data-step-accordion>
                <button type="button" class="wf-step-accordion-trigger" aria-expanded="true">
                  <span>Display Rules</span>
                  <svg class="wf-step-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
                </button>
                <div class="wf-step-accordion-panel">
                  <div class="wf-step-display-rules-stack">
                    <div id="wf-step-display-rules-cards-${stepId}" class="wf-step-display-rules-cards"></div>
                    <button type="button" class="wf-step-advanced-add-rule" data-wf-display-rule-add="${stepId}">+ Add Rule</button>
                  </div>
                </div>
              </section>
              <section class="wf-step-accordion wf-step-accordion--open" data-step-accordion>
                <button type="button" class="wf-step-accordion-trigger" aria-expanded="true">
                  <span>More Options</span>
                  <svg class="wf-step-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
                </button>
                <div class="wf-step-accordion-panel">
                  <div class="wf-step-toggle-row">
                    <span class="wf-step-toggle-label" id="wf-adv-optional-${stepId}">Make this an optional step</span>
                    <label class="wf-step-switch">
                      <input type="checkbox" class="wf-step-switch-input" name="wf-adv-optional" aria-labelledby="wf-adv-optional-${stepId}" />
                      <span class="wf-step-switch-track" aria-hidden="true"><span class="wf-step-switch-thumb"></span></span>
                    </label>
                  </div>
                  <div class="wf-step-toggle-row">
                    <span class="wf-step-toggle-label" id="wf-adv-spotlight-${stepId}">Show as spotlight</span>
                    <label class="wf-step-switch">
                      <input type="checkbox" class="wf-step-switch-input" name="wf-adv-spotlight" aria-labelledby="wf-adv-spotlight-${stepId}" />
                      <span class="wf-step-switch-track" aria-hidden="true"><span class="wf-step-switch-thumb"></span></span>
                    </label>
                  </div>
                  <div class="wf-step-toggle-row">
                    <span class="wf-step-toggle-label" id="wf-adv-back-${stepId}">Show back button</span>
                    <label class="wf-step-switch">
                      <input type="checkbox" class="wf-step-switch-input" name="wf-adv-back" aria-labelledby="wf-adv-back-${stepId}" checked />
                      <span class="wf-step-switch-track" aria-hidden="true"><span class="wf-step-switch-thumb"></span></span>
                    </label>
                  </div>
                  <div class="wf-step-advanced-divider" role="separator"></div>
                  <div class="wf-step-censor-row">
                    <div class="wf-step-censor-copy">
                      <span class="wf-step-censor-title">Censor sensitive info</span>
                      <span class="wf-step-censor-hint">Select areas to censor</span>
                    </div>
                    <button type="button" class="wf-step-censor-select">Select</button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <div class="wf-flow-step-editor-footer">
          <button type="button" class="wf-step-editor-cancel">Cancel</button>
          <button type="button" class="wf-step-editor-save">Save Step</button>
        </div>
      </div>
    `;

    content.querySelector('.wf-step-reselect-cta')?.addEventListener('click', () => {
      flowEditorState.pendingReselectStepId = stepId;
      startFlowStepSelectMode();
      backFlow();
    });

    content.querySelectorAll('[data-step-editor-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        const tabId = tabBtn.getAttribute('data-step-editor-tab');
        if (!tabId) return;
        content.querySelectorAll('[data-step-editor-tab]').forEach((b) => {
          const on = b.getAttribute('data-step-editor-tab') === tabId;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        content.querySelectorAll('[data-step-editor-tabpanel]').forEach((panel) => {
          const on = panel.getAttribute('data-step-editor-tabpanel') === tabId;
          panel.classList.toggle('active', on);
          panel.hidden = !on;
        });
      });
    });

    if (openAdvancedTab) {
      content.querySelector('[data-step-editor-tab="advanced"]')?.click();
    }

    content.querySelectorAll('[data-step-accordion]').forEach((section) => {
      const trigger = section.querySelector('.wf-step-accordion-trigger');
      trigger?.addEventListener('click', () => {
        const open = section.classList.toggle('wf-step-accordion--open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    const displayRulesCardsRoot = content.querySelector(`#wf-step-display-rules-cards-${stepId}`);
    function renumberDisplayRuleCards() {
      if (!displayRulesCardsRoot) return;
      displayRulesCardsRoot.querySelectorAll('.wf-step-display-rule-card').forEach((card, i) => {
        const titleEl = card.querySelector('.wf-step-display-rule-title');
        if (titleEl) titleEl.textContent = `Rule ${i + 1}`;
      });
    }
    function mountDisplayRuleCard(existingRule) {
      if (!displayRulesCardsRoot) return;
      const stepRef = steps[idx];
      if (!stepRef.displayRules) stepRef.displayRules = [];

      const isNew = !existingRule;
      const ruleId =
        existingRule && existingRule.id
          ? existingRule.id
          : 'dr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      let condition = (existingRule && existingRule.condition) || 'other_element';
      const targetLabelRaw = (existingRule && existingRule.targetLabel) || '';
      const targetLabel = targetLabelRaw.trim();

      if (isNew) {
        stepRef.displayRules.push({
          id: ruleId,
          condition: condition,
          targetLabel: '',
          targetSelectValue: ''
        });
      }

      const selOther = condition === 'other_element' ? ' selected' : '';
      const selUrl = condition === 'url' ? ' selected' : '';
      const selCustom = condition === 'custom' ? ' selected' : '';

      const targetSelVal =
        existingRule && existingRule.targetSelectValue != null
          ? String(existingRule.targetSelectValue)
          : '';
      const selTargetBlank = targetSelVal === '' ? ' selected' : '';
      const selTargetPrimary = targetSelVal === 'primary' ? ' selected' : '';

      const targetSelectInner = `<option value=""${selTargetBlank}>Select Element</option><option value="primary"${selTargetPrimary}>Primary target</option>`;

      const secondTargetCol = `<div class="wf-step-display-rule-dd wf-step-display-rule-dd--highlight">
            <select class="wf-step-display-rule-select wf-step-display-rule-target-select" aria-label="Target element">
              ${targetSelectInner}
            </select>
          </div>`;

      const hasPickedElement = Boolean(targetLabel);

      const pickedRow = hasPickedElement
        ? `<div class="wf-step-display-rule-picked-row">
            <input type="text" class="wf-step-display-rule-picked-input" readonly value="${wfEscapeHtml(targetLabel)}" aria-label="Picked element" data-wf-display-rule-embed="1" />
            <button type="button" class="wf-step-display-rule-picked-delete" aria-label="Remove picked element" title="Remove">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>`
        : '';

      const pickRow = hasPickedElement
        ? ''
        : '<button type="button" class="wf-step-display-rule-pick-btn">Select</button>';

      const card = document.createElement('div');
      card.className = 'wf-step-display-rule-card';
      card.setAttribute('data-wf-display-rule-id', ruleId);
      card.innerHTML = `
        <div class="wf-step-display-rule-head">
          <span class="wf-step-display-rule-title">Rule 1</span>
          <div class="wf-step-display-rule-actions">
            <button type="button" class="wf-step-display-rule-icon-btn" data-wf-display-rule-dismiss aria-label="Close rule">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button type="button" class="wf-step-display-rule-icon-btn" data-wf-display-rule-delete aria-label="Delete rule">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        <div class="wf-step-display-rule-dd-row">
          <div class="wf-step-display-rule-dd wf-step-display-rule-dd--condition">
            <select class="wf-step-display-rule-select" aria-label="Condition type">
              <option value="other_element"${selOther}>Other Element on Page</option>
              <option value="url"${selUrl}>Page URL</option>
              <option value="custom"${selCustom}>Custom</option>
            </select>
          </div>
          ${secondTargetCol}
        </div>
        ${pickRow}
        ${pickedRow}
      `;
      displayRulesCardsRoot.appendChild(card);
      renumberDisplayRuleCards();

      const condSelect = card.querySelector('.wf-step-display-rule-dd--condition select');
      const targetSelect = card.querySelector('.wf-step-display-rule-target-select');
      condSelect?.addEventListener('change', () => {
        const r = stepRef.displayRules.find((x) => x.id === ruleId);
        if (r) r.condition = condSelect.value;
      });
      targetSelect?.addEventListener('change', () => {
        const r = stepRef.displayRules.find((x) => x.id === ruleId);
        if (r) r.targetSelectValue = targetSelect.value;
      });

      const removeCard = () => {
        stepRef.displayRules = (stepRef.displayRules || []).filter((r) => r.id !== ruleId);
        card.remove();
        renumberDisplayRuleCards();
      };
      card.querySelector('[data-wf-display-rule-dismiss]')?.addEventListener('click', removeCard);
      card.querySelector('[data-wf-display-rule-delete]')?.addEventListener('click', removeCard);

      card.querySelector('.wf-step-display-rule-picked-delete')?.addEventListener('click', () => {
        const r = stepRef.displayRules.find((x) => x.id === ruleId);
        if (r) r.targetLabel = '';
        showFlowStepEditorPanel(stepId, { openAdvancedTab: true });
      });

      card.querySelector('.wf-step-display-rule-pick-btn')?.addEventListener('click', () => {
        const r = stepRef.displayRules.find((x) => x.id === ruleId);
        if (r && condSelect) r.condition = condSelect.value;
        if (r && targetSelect) r.targetSelectValue = targetSelect.value;
        flowEditorState.displayRulePick = { stepId: stepId, ruleId: ruleId };
        flowEditorState.flowSelectReturnToStepEditor = stepId;
        startFlowStepSelectMode({
          mode: 'displayRule',
          minibarTitle: 'Select element for display rule'
        });
      });
    }
    if (displayRulesCardsRoot && steps[idx].displayRules && steps[idx].displayRules.length) {
      steps[idx].displayRules.forEach((r) => mountDisplayRuleCard(r));
    }
    content.querySelector('[data-wf-display-rule-add]')?.addEventListener('click', () => mountDisplayRuleCard());

    const ruleSelect = content.querySelector('#wf-step-completion-rule');
    const manualRadio = content.querySelector('input[name="wf-step-completion-type"][value="manual"]');
    const syncRuleDropdown = () => {
      const manual = !!manualRadio?.checked;
      fillStepCompletionRuleSelect(ruleSelect, manual);
    };
    content.querySelectorAll('input[name="wf-step-completion-type"]').forEach((r) => {
      r.addEventListener('change', syncRuleDropdown);
    });
    syncRuleDropdown();

    function syncPositionUi(selectedKey) {
      content.querySelectorAll('[data-step-position]').forEach((btn) => {
        const on = btn.getAttribute('data-step-position') === selectedKey;
        btn.classList.toggle('wf-step-pos-opt--selected', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    content.querySelectorAll('[data-step-position]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-step-position');
        if (!key) return;
        steps[idx].tooltipPosition = key;
        syncPositionUi(key);
      });
    });

    const widgetLabelEl = content.querySelector('.wf-step-appearance-tooltip-label');
    content.querySelector('[data-wf-open-widget-picker]')?.addEventListener('click', () => {
      openWfFlowWidgetPicker(steps, idx, widgetLabelEl);
    });

    content.querySelector('.wf-step-editor-cancel')?.addEventListener('click', backFlow);
    content.querySelector('.wf-step-editor-save')?.addEventListener('click', backFlow);
  }

  function wireFlowSubpanelHeader(header, title, onBack) {
    header.innerHTML = `
      <button class="wf-header-back-btn" title="Back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
      </button>
      <span class="wf-header-title">${title}</span>
      <div class="wf-header-controls">
        <button class="wf-control-btn wf-move-btn" title="Move panel to left/right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11,17 6,12 11,7"/>
            <polyline points="13,17 18,12 13,7"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-minimize-btn" title="Minimize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-close-btn" title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    header.querySelector('.wf-header-back-btn')?.addEventListener('click', onBack);
    header.querySelector('.wf-close-btn')?.addEventListener('click', () => toggleStudio(false));
    header.querySelector('.wf-minimize-btn')?.addEventListener('click', () => studioOverlay.classList.toggle('wf-minimized'));
    header.querySelector('.wf-move-btn')?.addEventListener('click', () => togglePanelSide());
  }

  function showFlowDetailsPanel() {
    const content = studioOverlay.querySelector('.wf-studio-content');
    const header = studioOverlay.querySelector('.wf-studio-header');

    wireFlowSubpanelHeader(header, 'Flow Details', () =>
      showFlowPanel(flowEditorState.hasTimelineUi ? { timeline: true } : {})
    );

    content.innerHTML = `
      <div class="wf-flow-details-panel">
        <div class="wf-flow-details-tabs" role="tablist">
          <button type="button" class="wf-flow-details-tab active" role="tab" aria-selected="true" data-flow-details-tab="details">DETAILS</button>
          <button type="button" class="wf-flow-details-tab" role="tab" aria-selected="false" data-flow-details-tab="configurations">CONFIGURATIONS</button>
        </div>
        <div class="wf-flow-details-body">
          <div class="wf-flow-details-pane active" data-flow-details-pane="details" role="tabpanel">
            <div class="wf-flow-details-field">
              <label class="wf-flow-details-label" for="wf-flow-details-name">Flow name</label>
              <input id="wf-flow-details-name" type="text" class="wf-flow-details-input" autocomplete="off" />
            </div>
            <div class="wf-flow-details-field wf-flow-details-field--rte">
              <div class="wf-flow-details-label-row">
                <label class="wf-flow-details-label" for="wf-flow-details-desc">Flow description <span class="wf-flow-details-optional">(Optional)</span></label>
                <span class="wf-flow-details-hint"><span class="wf-flow-details-desc-count">0</span>/400 Character limit</span>
              </div>
              <div class="wf-flow-details-rte">
                <div class="wf-flow-details-rte-toolbar" aria-hidden="true">
                  <div class="wf-flow-details-rte-row">
                    <button type="button" class="wf-flow-details-rte-btn" title="Bold"><strong>B</strong></button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Italic"><em>i</em></button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Underline"><span class="wf-flow-details-uline">U</span></button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Text color">A</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Highlight">\u2710</button>
                    <button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Font size">Aa \u25BE</button>
                    <button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Alignment">\u2261 \u25BE</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Link" aria-hidden="true">\u{1F517}</button>
                  </div>
                  <div class="wf-flow-details-rte-row">
                    <button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Numbered list">1. \u25BE</button>
                    <button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Bullet list">\u2022 \u25BE</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Outdent">\u21E4</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Indent">\u21E5</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Image" aria-hidden="true">\u{1F5BC}\uFE0F</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Video">\u25B6</button>
                  </div>
                </div>
                <textarea id="wf-flow-details-desc" class="wf-flow-details-textarea wf-flow-details-textarea--rte" maxlength="400" rows="5"></textarea>
              </div>
            </div>
            <hr class="wf-flow-details-divider" />
            <div class="wf-flow-details-field">
              <div class="wf-flow-details-label-row">
                <label class="wf-flow-details-label" for="wf-flow-details-tags">Tags <span class="wf-flow-details-optional">(Optional)</span></label>
                <span class="wf-flow-details-hint"><span class="wf-flow-details-tags-count">0</span>/75</span>
              </div>
              <input id="wf-flow-details-tags" type="text" class="wf-flow-details-input" maxlength="75" autocomplete="off" />
            </div>
            <div class="wf-flow-details-field">
              <label class="wf-flow-details-label" for="wf-flow-details-keywords">Keywords <span class="wf-flow-details-optional">(Optional)</span></label>
              <input id="wf-flow-details-keywords" type="text" class="wf-flow-details-input" autocomplete="off" />
            </div>
            <div class="wf-flow-details-field">
              <label class="wf-flow-details-label" for="wf-flow-details-apptype">App type</label>
              <input
                id="wf-flow-details-apptype"
                type="text"
                class="wf-flow-details-input wf-flow-details-apptype-input"
                value="iOS"
                disabled
                readonly
                aria-label="App type"
              />
              <p class="wf-flow-details-hint wf-flow-apptype-pairing-hint">Automatically set from screen pairing.</p>
            </div>
          </div>
          <div class="wf-flow-details-pane" data-flow-details-pane="configurations" role="tabpanel" hidden>
            <div class="wf-flow-config-section">
              <label class="wf-flow-config-label-muted" for="wf-config-theme">Flow Theme</label>
              <div class="wf-flow-config-select-wrap">
                <select id="wf-config-theme" class="wf-flow-config-select">
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
            <div class="wf-flow-config-section">
              <div class="wf-flow-config-label-row">
                <span class="wf-flow-config-label-muted">Flow Trigger</span>
                <label class="wf-flow-config-switch">
                  <input type="checkbox" id="wf-config-flow-trigger" class="wf-flow-config-switch-input" aria-label="Flow Trigger" />
                  <span class="wf-flow-config-switch-ui" aria-hidden="true"></span>
                </label>
              </div>
              <div id="wf-config-flow-trigger-fields" class="wf-flow-config-trigger-fields">
                <div class="wf-flow-config-select-wrap wf-flow-config-select-wrap--full">
                  <select id="wf-config-trigger-action" class="wf-flow-config-select" aria-label="Flow trigger action">
                    <option value="select_user_action">Select User Action</option>
                    <option value="screen_detection">Screen detection</option>
                  </select>
                </div>
                <div id="wf-config-screen-timing-block" class="wf-flow-config-cascade" hidden>
                  <label class="wf-flow-config-label-muted" for="wf-config-screen-timing">Timing</label>
                  <div class="wf-flow-config-select-wrap wf-flow-config-select-wrap--full">
                    <select id="wf-config-screen-timing" class="wf-flow-config-select" aria-label="Screen detection timing">
                      <option value="instant">Instant</option>
                      <option value="after_delay">After delay</option>
                    </select>
                  </div>
                </div>
                <div class="wf-flow-config-cascade wf-flow-config-frequency-wrap">
                  <label class="wf-flow-config-label-muted" for="wf-config-frequency">Frequency</label>
                  <div class="wf-flow-config-select-wrap wf-flow-config-select-wrap--full">
                    <select id="wf-config-frequency" class="wf-flow-config-select" aria-label="Flow frequency">
                      <option value="play_once_lifetime">Play once in a life-time</option>
                      <option value="every_session">In every session</option>
                      <option value="every_session_until_dismissed">In every session until dismissed by user</option>
                      <option value="on_icon_click">On Icon click</option>
                      <option value="every_session_until_flow_complete">Every session until flow complete</option>
                    </select>
                  </div>
                </div>
                <div id="wf-config-delay-wrap" class="wf-flow-config-cascade wf-flow-config-cascade--delay" hidden>
                  <label class="wf-flow-config-label-muted" for="wf-config-delay-seconds">Delay time (seconds)</label>
                  <input id="wf-config-delay-seconds" type="number" class="wf-flow-details-input wf-flow-config-delay-input" min="0" step="1" placeholder="e.g. 3" inputmode="numeric" />
                </div>
                <div class="wf-flow-config-callout" role="note">
                  <span class="wf-flow-config-callout-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <circle cx="12" cy="16" r="1.25" fill="currentColor" stroke="none"/>
                    </svg>
                  </span>
                  <p class="wf-flow-config-callout-text">Autotrigger this flow when the selected User Action is completed</p>
                </div>
              </div>
            </div>
            <div class="wf-flow-config-section">
              <div class="wf-flow-config-label-row">
                <span class="wf-flow-config-label-muted">Goal (Mark flow complete if)</span>
                <label class="wf-flow-config-switch">
                  <input type="checkbox" id="wf-config-goal" class="wf-flow-config-switch-input" aria-label="Goal (Mark flow complete if)" />
                  <span class="wf-flow-config-switch-ui" aria-hidden="true"></span>
                </label>
              </div>
              <button type="button" class="wf-flow-config-dashed-btn">Attach User Action as Goal</button>
              <p class="wf-flow-config-suffix">is completed</p>
              <div class="wf-flow-config-callout" role="note">
                <span class="wf-flow-config-callout-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <circle cx="12" cy="16" r="1.25" fill="currentColor" stroke="none"/>
                  </svg>
                </span>
                <p class="wf-flow-config-callout-text">Flow is marked complete when user performs that action</p>
              </div>
            </div>
          </div>
        </div>
        <div class="wf-flow-details-footer">
          <button type="button" class="wf-flow-details-cancel">Cancel</button>
          <button type="button" class="wf-flow-details-save">Save</button>
        </div>
      </div>
    `;

    const nameEl = content.querySelector('#wf-flow-details-name');
    const descTa = content.querySelector('#wf-flow-details-desc');
    const tagsIn = content.querySelector('#wf-flow-details-tags');
    const keywordsEl = content.querySelector('#wf-flow-details-keywords');
    const apptypeEl = content.querySelector('#wf-flow-details-apptype');
    if (nameEl) nameEl.value = flowEditorState.name;
    if (descTa) descTa.value = flowEditorState.description;
    if (tagsIn) tagsIn.value = flowEditorState.tags;
    if (keywordsEl) keywordsEl.value = flowEditorState.keywords;
    if (apptypeEl) {
      apptypeEl.value = 'iOS';
      flowEditorState.apptype = 'ios';
    }

    const cfgDefaults = {
      theme: 'modern',
      flowTrigger: true,
      goal: true,
      triggerUserAction: 'select_user_action',
      screenDetectionTiming: 'instant',
      delaySeconds: '',
      frequency: 'every_session'
    };
    const cfg = { ...cfgDefaults, ...(flowEditorState.config || {}) };
    flowEditorState.config = cfg;
    const themeSel = content.querySelector('#wf-config-theme');
    const triggerChk = content.querySelector('#wf-config-flow-trigger');
    const goalChk = content.querySelector('#wf-config-goal');
    const triggerFieldsWrap = content.querySelector('#wf-config-flow-trigger-fields');
    const triggerActionSel = content.querySelector('#wf-config-trigger-action');
    const screenTimingBlock = content.querySelector('#wf-config-screen-timing-block');
    const screenTimingSel = content.querySelector('#wf-config-screen-timing');
    const delayWrap = content.querySelector('#wf-config-delay-wrap');
    const delayInput = content.querySelector('#wf-config-delay-seconds');
    const frequencySel = content.querySelector('#wf-config-frequency');
    if (themeSel) themeSel.value = cfg.theme || 'modern';
    if (triggerChk) triggerChk.checked = !!cfg.flowTrigger;
    if (goalChk) goalChk.checked = !!cfg.goal;
    if (triggerActionSel) triggerActionSel.value = cfg.triggerUserAction || 'select_user_action';
    if (screenTimingSel) screenTimingSel.value = cfg.screenDetectionTiming || 'instant';
    if (delayInput) delayInput.value = cfg.delaySeconds != null ? String(cfg.delaySeconds) : '';
    if (frequencySel) {
      const fv = cfg.frequency || 'every_session';
      frequencySel.value = [...frequencySel.options].some((o) => o.value === fv) ? fv : 'every_session';
    }

    function syncFlowTriggerCascade() {
      if (!triggerChk?.checked) return;
      const mode = triggerActionSel?.value || 'select_user_action';
      const showScreen = mode === 'screen_detection';
      if (screenTimingBlock) screenTimingBlock.hidden = !showScreen;
      const timing = screenTimingSel?.value || 'instant';
      const showDelay = showScreen && timing === 'after_delay';
      if (delayWrap) delayWrap.hidden = !showDelay;
    }

    function syncFlowTriggerFieldsVisibility() {
      const on = !!triggerChk?.checked;
      if (triggerFieldsWrap) triggerFieldsWrap.hidden = !on;
      if (on) syncFlowTriggerCascade();
    }

    syncFlowTriggerFieldsVisibility();
    triggerChk?.addEventListener('change', syncFlowTriggerFieldsVisibility);
    triggerActionSel?.addEventListener('change', syncFlowTriggerCascade);
    screenTimingSel?.addEventListener('change', syncFlowTriggerCascade);

    const descCountEl = content.querySelector('.wf-flow-details-desc-count');
    const tagsCountEl = content.querySelector('.wf-flow-details-tags-count');

    function syncDescCount() {
      if (descTa && descCountEl) descCountEl.textContent = String(descTa.value.length);
    }
    function syncTagsCount() {
      if (tagsIn && tagsCountEl) tagsCountEl.textContent = String(tagsIn.value.length);
    }
    syncDescCount();
    syncTagsCount();
    descTa?.addEventListener('input', syncDescCount);
    tagsIn?.addEventListener('input', syncTagsCount);

    const tabs = content.querySelectorAll('[data-flow-details-tab]');
    const panes = content.querySelectorAll('[data-flow-details-pane]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-flow-details-tab');
        tabs.forEach((t) => {
          const on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panes.forEach((p) => {
          const on = p.getAttribute('data-flow-details-pane') === id;
          p.classList.toggle('active', on);
          p.hidden = !on;
        });
      });
    });

    const backToFlowFromDetails = () =>
      showFlowPanel(flowEditorState.hasTimelineUi ? { timeline: true } : {});

    content.querySelector('.wf-flow-details-cancel')?.addEventListener('click', backToFlowFromDetails);
    content.querySelector('.wf-flow-details-save')?.addEventListener('click', () => {
      flowEditorState.name = content.querySelector('#wf-flow-details-name')?.value ?? '';
      flowEditorState.description = descTa?.value ?? '';
      flowEditorState.tags = tagsIn?.value ?? '';
      flowEditorState.keywords = content.querySelector('#wf-flow-details-keywords')?.value ?? '';
      flowEditorState.apptype = 'ios';
      flowEditorState.config = {
        theme: content.querySelector('#wf-config-theme')?.value ?? 'modern',
        flowTrigger: !!content.querySelector('#wf-config-flow-trigger')?.checked,
        goal: !!content.querySelector('#wf-config-goal')?.checked,
        triggerUserAction: content.querySelector('#wf-config-trigger-action')?.value ?? 'select_user_action',
        screenDetectionTiming: content.querySelector('#wf-config-screen-timing')?.value ?? 'instant',
        delaySeconds: content.querySelector('#wf-config-delay-seconds')?.value ?? '',
        frequency: content.querySelector('#wf-config-frequency')?.value ?? 'every_session'
      };
      backToFlowFromDetails();
    });
  }

  /**
   * Widget Details Panel - same UI as Flow Details but for Popup/Smart Tip/Beacon
   */
  function showWidgetDetailsPanel(widgetLabel, onBack) {
    const content = studioOverlay.querySelector('.wf-studio-content');
    const header = studioOverlay.querySelector('.wf-studio-header');

    wireFlowSubpanelHeader(header, `${widgetLabel} Details`, onBack);

    const wl = wfEscapeHtml(widgetLabel);
    const currentName = popupEditorState?.name || '';
    const currentDesc = popupEditorState?.description || '';

    content.innerHTML = `
      <div class="wf-flow-details-panel">
        <div class="wf-flow-details-tabs" role="tablist">
          <button type="button" class="wf-flow-details-tab active" role="tab" aria-selected="true" data-flow-details-tab="details">DETAILS</button>
          <button type="button" class="wf-flow-details-tab" role="tab" aria-selected="false" data-flow-details-tab="configurations">CONFIGURATIONS</button>
        </div>
        <div class="wf-flow-details-body">
          <div class="wf-flow-details-pane active" data-flow-details-pane="details" role="tabpanel">
            <div class="wf-flow-details-field">
              <label class="wf-flow-details-label" for="wf-widget-details-name">${wl} name</label>
              <input id="wf-widget-details-name" type="text" class="wf-flow-details-input" value="${wfEscapeHtml(currentName)}" autocomplete="off" />
            </div>
            <div class="wf-flow-details-field wf-flow-details-field--rte">
              <div class="wf-flow-details-label-row">
                <label class="wf-flow-details-label" for="wf-widget-details-desc">${wl} description <span class="wf-flow-details-optional">(Optional)</span></label>
                <span class="wf-flow-details-hint"><span class="wf-widget-details-desc-count">0</span>/400 Character limit</span>
              </div>
              <div class="wf-flow-details-rte">
                <div class="wf-flow-details-rte-toolbar" aria-hidden="true">
                  <div class="wf-flow-details-rte-row">
                    <button type="button" class="wf-flow-details-rte-btn" title="Bold"><strong>B</strong></button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Italic"><em>i</em></button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Underline"><span class="wf-flow-details-uline">U</span></button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Text color">A</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Highlight">\u2710</button>
                    <button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Font size">Aa \u25BE</button>
                    <button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Alignment">\u2261 \u25BE</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Link" aria-hidden="true">\u{1F517}</button>
                  </div>
                  <div class="wf-flow-details-rte-row">
                    <button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Numbered list">1. \u25BE</button>
                    <button type="button" class="wf-flow-details-rte-btn wf-flow-details-rte-btn--wide" title="Bullet list">\u2022 \u25BE</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Outdent">\u21E4</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Indent">\u21E5</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Image" aria-hidden="true">\u{1F5BC}\uFE0F</button>
                    <button type="button" class="wf-flow-details-rte-btn" title="Video">\u25B6</button>
                  </div>
                </div>
                <textarea id="wf-widget-details-desc" class="wf-flow-details-textarea wf-flow-details-textarea--rte" maxlength="400" rows="5">${wfEscapeHtml(currentDesc)}</textarea>
              </div>
            </div>
            <hr class="wf-flow-details-divider" />
            <div class="wf-flow-details-field">
              <div class="wf-flow-details-label-row">
                <label class="wf-flow-details-label" for="wf-widget-details-tags">Tags <span class="wf-flow-details-optional">(Optional)</span></label>
                <span class="wf-flow-details-hint"><span class="wf-widget-details-tags-count">0</span>/75</span>
              </div>
              <input id="wf-widget-details-tags" type="text" class="wf-flow-details-input" maxlength="75" autocomplete="off" />
            </div>
            <div class="wf-flow-details-field">
              <label class="wf-flow-details-label" for="wf-widget-details-keywords">Keywords <span class="wf-flow-details-optional">(Optional)</span></label>
              <input id="wf-widget-details-keywords" type="text" class="wf-flow-details-input" autocomplete="off" />
            </div>
            <div class="wf-flow-details-field">
              <label class="wf-flow-details-label" for="wf-widget-details-apptype">App type</label>
              <input
                id="wf-widget-details-apptype"
                type="text"
                class="wf-flow-details-input wf-flow-details-apptype-input"
                value="iOS"
                disabled
                readonly
                aria-label="App type"
              />
              <p class="wf-flow-details-hint wf-flow-apptype-pairing-hint">Automatically set from screen pairing.</p>
            </div>
          </div>
          <div class="wf-flow-details-pane" data-flow-details-pane="configurations" role="tabpanel" hidden>
            <div class="wf-flow-config-section">
              <label class="wf-flow-config-label-muted" for="wf-widget-config-theme">${wl} Theme</label>
              <div class="wf-flow-config-select-wrap">
                <select id="wf-widget-config-theme" class="wf-flow-config-select">
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
            <div class="wf-flow-config-section">
              <div class="wf-flow-config-label-row">
                <span class="wf-flow-config-label-muted">${wl} Trigger</span>
                <label class="wf-flow-config-switch">
                  <input type="checkbox" id="wf-widget-config-trigger" class="wf-flow-config-switch-input" aria-label="${wl} Trigger" />
                  <span class="wf-flow-config-switch-ui" aria-hidden="true"></span>
                </label>
              </div>
              <div id="wf-widget-config-trigger-fields" class="wf-flow-config-trigger-fields">
                <div class="wf-flow-config-select-wrap wf-flow-config-select-wrap--full">
                  <select id="wf-widget-config-trigger-action" class="wf-flow-config-select" aria-label="${wl} trigger action">
                    <option value="select_user_action">Select User Action</option>
                    <option value="screen_detection">Screen detection</option>
                  </select>
                </div>
                <div class="wf-flow-config-cascade wf-flow-config-frequency-wrap">
                  <label class="wf-flow-config-label-muted" for="wf-widget-config-frequency">Frequency</label>
                  <div class="wf-flow-config-select-wrap wf-flow-config-select-wrap--full">
                    <select id="wf-widget-config-frequency" class="wf-flow-config-select" aria-label="${wl} frequency">
                      <option value="play_once_lifetime">Play once in a life-time</option>
                      <option value="every_session">In every session</option>
                      <option value="every_session_until_dismissed">In every session until dismissed by user</option>
                      <option value="on_icon_click">On Icon click</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="wf-flow-details-footer">
          <button type="button" class="wf-flow-details-cancel">Cancel</button>
          <button type="button" class="wf-flow-details-save">Save Details</button>
        </div>
      </div>
    `;

    const descTa = content.querySelector('#wf-widget-details-desc');
    const descCountEl = content.querySelector('.wf-widget-details-desc-count');
    const tagsIn = content.querySelector('#wf-widget-details-tags');
    const tagsCountEl = content.querySelector('.wf-widget-details-tags-count');

    function syncDescCount() {
      if (descTa && descCountEl) descCountEl.textContent = String(descTa.value.length);
    }
    function syncTagsCount() {
      if (tagsIn && tagsCountEl) tagsCountEl.textContent = String(tagsIn.value.length);
    }
    syncDescCount();
    syncTagsCount();
    descTa?.addEventListener('input', syncDescCount);
    tagsIn?.addEventListener('input', syncTagsCount);

    const tabs = content.querySelectorAll('[data-flow-details-tab]');
    const panes = content.querySelectorAll('[data-flow-details-pane]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-flow-details-tab');
        tabs.forEach((t) => {
          const on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panes.forEach((p) => {
          const on = p.getAttribute('data-flow-details-pane') === id;
          p.classList.toggle('active', on);
          p.hidden = !on;
        });
      });
    });

    content.querySelector('.wf-flow-details-cancel')?.addEventListener('click', onBack);
    content.querySelector('.wf-flow-details-save')?.addEventListener('click', () => {
      if (popupEditorState) {
        popupEditorState.name = content.querySelector('#wf-widget-details-name')?.value ?? '';
        popupEditorState.description = descTa?.value ?? '';
        popupEditorState.tags = tagsIn?.value ?? '';
        popupEditorState.keywords = content.querySelector('#wf-widget-details-keywords')?.value ?? '';
      }
      onBack();
    });
  }

  function showSeekPanel() {
    const content = studioOverlay.querySelector('.wf-studio-content');
    
    // Update the header to show back button, Seek label, and control buttons
    const header = studioOverlay.querySelector('.wf-studio-header');
    header.innerHTML = `
      <button class="wf-header-back-btn" title="Back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
      </button>
      <span class="wf-header-title">Seek</span>
      <div class="wf-header-controls">
        <button class="wf-control-btn wf-collapse-btn" title="Collapse">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11,17 6,12 11,7"/>
            <polyline points="18,17 13,12 18,7"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-minimize-btn" title="Minimize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button class="wf-control-btn wf-close-btn" title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    
    // Add back button listener
    const headerBackBtn = header.querySelector('.wf-header-back-btn');
    headerBackBtn?.addEventListener('click', () => {
      resetToMainView();
    });
    
    // Add control button listeners
    const closeBtn = header.querySelector('.wf-close-btn');
    const minimizeBtn = header.querySelector('.wf-minimize-btn');
    const collapseBtn = header.querySelector('.wf-collapse-btn');
    
    closeBtn?.addEventListener('click', () => {
      toggleStudio(false);
    });
    
    minimizeBtn?.addEventListener('click', () => {
      studioOverlay.classList.toggle('wf-minimized');
    });
    
    collapseBtn?.addEventListener('click', () => {
      studioOverlay.classList.toggle('wf-collapsed');
    });
    
    content.innerHTML = `
      <div class="wf-seek-panel">
        <div class="wf-url-input-group">
          <label class="wf-url-label">
            <span>URL</span>
            <span class="wf-url-counter"><span class="wf-url-count">0</span>/100</span>
          </label>
          <input type="text" class="wf-url-input" value="${window.location.href}" disabled />
        </div>

        <div class="wf-capture-illustration">
          <div class="wf-capture-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C84900" stroke-width="1.5" stroke-dasharray="3 3">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 2"/>
            </svg>
            <svg class="wf-cursor-icon" width="24" height="24" viewBox="0 0 24 24" fill="#C84900">
              <path d="M4 4l7 17 2.5-6.5L20 12 4 4z"/>
            </svg>
          </div>
        </div>

        <p class="wf-capture-description">
          Capture your workflow via point and click to turn any task into an automated skill
        </p>

        <button class="wf-start-capture-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
          Start capturing
        </button>
      </div>
    `;

    const urlInput = content.querySelector('.wf-url-input');
    const urlCount = content.querySelector('.wf-url-count');
    if (urlInput && urlCount) {
      urlCount.textContent = urlInput.value.length;
    }

    const startCaptureBtn = content.querySelector('.wf-start-capture-btn');
    startCaptureBtn?.addEventListener('click', () => {
      handleSeekAction('record');
    });
  }

  /** Whatfix project + widget catalog for guardrails (demo data keyed by project ID). */
  function getWhatfixProjectMeta() {
    const sel = studioOverlay?.querySelector('.wf-project-dropdown');
    const val = sel && sel.value ? sel.value : 'sharepoint';
    const labels = { sharepoint: 'Sharepoint_Demo', salesforce: 'Salesforce_CRM', workday: 'Workday_HR' };
    const ids = {
      sharepoint: 'WF-PRJ-SSP-8472',
      salesforce: 'WF-PRJ-SF-2201',
      workday: 'WF-PRJ-WD-1190'
    };
    return { key: val, label: labels[val] || labels.sharepoint, id: ids[val] || ids.sharepoint };
  }

  function getWhatfixWidgetsForProject(projectId) {
    return [
      { id: 'wg-beacon-01', widgetType: 'Beacon', title: 'Onboarding spotlight', content: 'Highlights the home dashboard and key navigation for new users.' },
      { id: 'wg-smart-02', widgetType: 'Smart-tip', title: 'Save shortcut', content: 'Use Ctrl+S / Cmd+S to save your requisition draft without leaving the page.' },
      { id: 'wg-popup-03', widgetType: 'Popup', title: 'Q1 procurement policy', content: 'Reminder: purchases over $10K require secondary Finance approval.' },
      { id: 'wg-launcher-04', widgetType: 'Launcher', title: 'Self-help resources', content: 'Quick links to policy PDF, catalog search, and support chat.' },
      { id: 'wg-survey-05', widgetType: 'Survey', title: 'Post-submit feedback', content: 'Optional 2-question survey after requisition submission.' },
      { id: 'wg-beacon-06', widgetType: 'Beacon', title: 'Approvals queue', content: 'Points approvers to the pending items table and SLA timers.' },
      { id: 'wg-popup-07', widgetType: 'Popup', title: 'Maintenance window', content: 'Scheduled downtime notice for the vendor catalog integration.' },
      { id: 'wg-smart-08', widgetType: 'Smart-tip', title: 'Line items', content: 'Explains GL code and cost center defaults from your profile.' },
      { id: 'wg-launcher-09', widgetType: 'Launcher', title: 'Training videos', content: 'Embedded playlist: creating a PR, approvals, and PO follow-up.' },
      { id: 'wg-survey-10', widgetType: 'Survey', title: 'NPS — procurement', content: 'Quarterly Net Promoter Score for the procurement portal.' }
    ].map((w) => ({ ...w, projectId }));
  }

  /** Safe string for HTML textarea body (avoids breaking out of &lt;/textarea&gt;). */
  function escapeForTextareaContent(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Safe string for double-quoted HTML attributes. */
  function escapeForAttr(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  /**
   * Default URL pattern for visibility (Proflow / current app scope from the page URL).
   */
  function buildProflowUrlPatternFromLocation() {
    try {
      const u = new URL(window.location.href);
      const path = u.pathname.replace(/\/+$/, '') || '';
      const dir = path.replace(/\/[^/]+$/, '') || '';
      return `${u.origin}${dir}/*`;
    } catch (e) {
      return '';
    }
  }

  /**
   * Suggested skill name from the first captured step label (process entry point).
   */
  function buildSuggestedSkillNameFromSteps(steps) {
    if (!steps || steps.length === 0) return '';
    const raw = (steps[0].target || 'Captured workflow').replace(/\s+/g, ' ').trim();
    if (!raw) return 'Captured workflow';
    return raw.length > 64 ? `${raw.slice(0, 61)}…` : raw;
  }

  /**
   * Self-populated skill prompt describing the captured Seek / UI flow.
   */
  function buildSkillPromptFromCaptureSteps(steps) {
    if (!steps || steps.length === 0) {
      return [
        'When this skill runs, guide the user through the task on the current page using the application UI.',
        '',
        'No steps were captured in Seek. After you record a flow, reopen this screen to auto-fill this prompt, or describe the exact task, fields, and success criteria here.'
      ].join('\n');
    }
    const intro = [
      'Process flow (from Seek capture) — execute in order:',
      '',
      '• Wait for the page or panel to be ready after each step before continuing.',
      '• Prefer the described labels and elements; if something is missing, ask the user briefly.',
      '• Confirm with the user before irreversible actions (submit, delete, purchase, etc.).',
      ''
    ].join('\n');
    const numbered = steps.map((s, i) => {
      const n = s.number != null ? s.number : i + 1;
      const action = (s.action || 'Action').trim();
      const target = (s.target || 'UI element').trim();
      const desc = (s.description || '').trim();
      let block = `${n}. ${action} on or near: ${target}`;
      if (desc) block += `\n   Additional context: ${desc}`;
      return block;
    });
    const outro = [
      '',
      'End state: when these steps are complete, briefly confirm success with the user and offer a next action if relevant.'
    ].join('\n');
    return intro + numbered.join('\n\n') + outro;
  }

  function showSkillConfigPanel() {
    const content = studioOverlay.querySelector('.wf-studio-content');
    const meta = getWhatfixProjectMeta();
    const widgets = getWhatfixWidgetsForProject(meta.id);
    const generatedSkillPrompt = escapeForTextareaContent(buildSkillPromptFromCaptureSteps(capturedSteps));
    const suggestedSkillName = escapeForAttr(buildSuggestedSkillNameFromSteps(capturedSteps));
    const proflowUrlPattern = escapeForTextareaContent(buildProflowUrlPatternFromLocation());

    content.innerHTML = `
      <div class="wf-seek-panel wf-skill-config-screen">
        <div class="wf-skill-config-tabs" role="tablist">
          <button type="button" class="wf-skill-config-tab active" role="tab" aria-selected="true" data-skill-tab="configuration">Configuration</button>
          <button type="button" class="wf-skill-config-tab" role="tab" aria-selected="false" data-skill-tab="visibility">Visibility rules</button>
        </div>

        <div class="wf-skill-config-panels">
          <div class="wf-skill-tab-panel active" data-skill-panel="configuration" role="tabpanel">
            <div class="wf-url-input-group wf-url-input-group--skill">
              <label class="wf-url-label">
                <span>URL</span>
                <span class="wf-url-counter"><span class="wf-url-count">0</span>/100</span>
              </label>
              <input type="text" class="wf-url-input wf-skill-url-input" value="${String(window.location.href).replace(/"/g, '&quot;')}" disabled />
            </div>

            <div class="wf-skill-field">
              <label class="wf-skill-field-label" for="wf-skill-name">Name skill</label>
              <input type="text" id="wf-skill-name" class="wf-skill-text-input" placeholder="e.g. Create purchase requisition" autocomplete="off" value="${suggestedSkillName}" />
            </div>

            <div class="wf-skill-field">
              <label class="wf-skill-field-label" for="wf-skill-prompt">Skill prompt</label>
              <textarea id="wf-skill-prompt" class="wf-skill-textarea wf-skill-prompt-auto" rows="8" placeholder="Describe what the skill should do when invoked…">${generatedSkillPrompt}</textarea>
            </div>

            <div class="wf-skill-field">
              <label class="wf-skill-field-label" for="wf-skill-custom">Custom instructions</label>
              <textarea id="wf-skill-custom" class="wf-skill-textarea" rows="3" placeholder="Optional tone, constraints, or steps the model should prefer…"></textarea>
            </div>

            <div class="wf-skill-field wf-guardrails-block">
              <span class="wf-skill-field-label">Attach guardrails</span>
              <p class="wf-guardrails-hint">Choose Whatfix widgets and in-app content tied to <strong class="wf-guardrails-project-label">${meta.id}</strong> (${meta.label})</p>
              <div class="wf-guardrails-combo">
                <input type="text" class="wf-guardrails-summary-input" readonly placeholder="Select one or more guardrails…" aria-label="Selected guardrails" />
                <button type="button" class="wf-guardrails-toggle" aria-expanded="false" title="Browse Whatfix widgets and content">
                  <svg class="wf-guardrails-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="wf-skill-tab-panel" data-skill-panel="visibility" role="tabpanel" hidden>
            <div class="wf-visibility-accordions">
              <div class="wf-visibility-accordion-item">
                <button type="button" class="wf-visibility-accordion-trigger" aria-expanded="false" id="wf-vis-acc-where">
                  <span class="wf-visibility-accordion-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <span class="wf-visibility-accordion-label">Where does the job appear</span>
                  <span class="wf-visibility-accordion-chevron" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="wf-visibility-accordion-panel" id="wf-vis-panel-where" hidden>
                  <div class="wf-visibility-panel-inner">
                    <p class="wf-visibility-panel-hint">Limit this skill to specific URLs or page rules.</p>
                    <label class="wf-skill-field-label" for="wf-vis-url-patterns">URL patterns</label>
                    <textarea id="wf-vis-url-patterns" class="wf-skill-textarea" rows="3" placeholder="e.g. https://proflow.example.com/app/*">${proflowUrlPattern}</textarea>
                  </div>
                </div>
              </div>
              <div class="wf-visibility-accordion-item">
                <button type="button" class="wf-visibility-accordion-trigger" aria-expanded="false" id="wf-vis-acc-when">
                  <span class="wf-visibility-accordion-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                  <span class="wf-visibility-accordion-label">When does the job start and stop appearing</span>
                  <span class="wf-visibility-accordion-chevron" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="wf-visibility-accordion-panel" id="wf-vis-panel-when" hidden>
                  <div class="wf-visibility-panel-inner">
                    <p class="wf-visibility-panel-hint">Schedule when the skill is available to users.</p>
                    <div class="wf-visibility-date-row">
                      <div class="wf-skill-field">
                        <label class="wf-skill-field-label" for="wf-vis-start">Start date</label>
                        <input type="date" id="wf-vis-start" class="wf-skill-text-input" />
                      </div>
                      <div class="wf-skill-field">
                        <label class="wf-skill-field-label" for="wf-vis-end">End date</label>
                        <input type="date" id="wf-vis-end" class="wf-skill-text-input" />
                      </div>
                    </div>

                    <div class="wf-vis-time-section">
                      <div class="wf-vis-time-row">
                        <div class="wf-skill-field">
                          <label class="wf-skill-field-label" for="wf-vis-time-start">Start time</label>
                          <input type="time" id="wf-vis-time-start" class="wf-skill-text-input" />
                        </div>
                        <div class="wf-skill-field">
                          <label class="wf-skill-field-label" for="wf-vis-time-end">End time</label>
                          <input type="time" id="wf-vis-time-end" class="wf-skill-text-input" />
                        </div>
                      </div>
                      <div class="wf-skill-field">
                        <label class="wf-skill-field-label" for="wf-vis-timezone">Timezone</label>
                        <select id="wf-vis-timezone" class="wf-skill-text-input">
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern (US) — America/New_York</option>
                          <option value="America/Chicago">Central (US) — America/Chicago</option>
                          <option value="America/Denver">Mountain (US) — America/Denver</option>
                          <option value="America/Los_Angeles">Pacific (US) — America/Los_Angeles</option>
                          <option value="Europe/London">London — Europe/London</option>
                          <option value="Europe/Paris">Paris — Europe/Paris</option>
                          <option value="Asia/Kolkata">India — Asia/Kolkata</option>
                          <option value="Asia/Singapore">Singapore — Asia/Singapore</option>
                          <option value="Asia/Tokyo">Tokyo — Asia/Tokyo</option>
                          <option value="Australia/Sydney">Sydney — Australia/Sydney</option>
                        </select>
                      </div>
                      <label class="wf-vis-local-toggle">
                        <input type="checkbox" id="wf-vis-local-time" />
                        <span>Show schedule in local time</span>
                      </label>
                    </div>

                    <div class="wf-skill-field">
                      <label class="wf-skill-field-label" for="wf-vis-interval">Interval</label>
                      <select id="wf-vis-interval" class="wf-skill-text-input">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="select-days">Select days</option>
                      </select>
                    </div>

                    <div class="wf-vis-interval-detail" data-vis-interval="daily">
                      <p class="wf-visibility-panel-hint">Set how many times the schedule runs per day.</p>
                      <div class="wf-skill-field">
                        <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-vis-times-daily">Number of times daily</label>
                        <input type="number" id="wf-vis-times-daily" class="wf-skill-text-input" min="1" step="1" placeholder="e.g. 3" />
                      </div>
                    </div>

                    <div class="wf-vis-interval-detail" data-vis-interval="weekly" hidden>
                      <p class="wf-visibility-panel-hint">Set how many times the schedule runs per week.</p>
                      <div class="wf-skill-field">
                        <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-vis-times-weekly">Number of times weekly</label>
                        <input type="number" id="wf-vis-times-weekly" class="wf-skill-text-input" min="1" step="1" placeholder="e.g. 2" />
                      </div>
                    </div>

                    <div class="wf-vis-interval-detail" data-vis-interval="monthly" hidden>
                      <p class="wf-visibility-panel-hint">Set how many times the schedule runs per month.</p>
                      <div class="wf-skill-field">
                        <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-vis-times-monthly">Number of times monthly</label>
                        <input type="number" id="wf-vis-times-monthly" class="wf-skill-text-input" min="1" step="1" placeholder="e.g. 1" />
                      </div>
                    </div>

                    <div class="wf-vis-interval-detail" data-vis-interval="select-days" hidden>
                      <p class="wf-visibility-panel-hint">Select which days apply (Sunday–Saturday).</p>
                      <div class="wf-vis-weekday-blocks" role="group" aria-label="Days of week, Sunday through Saturday">
                        <label class="wf-vis-weekday-block"><input type="checkbox" name="wf-vis-weekday" value="sun" /><span class="wf-vis-weekday-initial">Su</span></label>
                        <label class="wf-vis-weekday-block"><input type="checkbox" name="wf-vis-weekday" value="mon" /><span class="wf-vis-weekday-initial">Mo</span></label>
                        <label class="wf-vis-weekday-block"><input type="checkbox" name="wf-vis-weekday" value="tue" /><span class="wf-vis-weekday-initial">Tu</span></label>
                        <label class="wf-vis-weekday-block"><input type="checkbox" name="wf-vis-weekday" value="wed" /><span class="wf-vis-weekday-initial">We</span></label>
                        <label class="wf-vis-weekday-block"><input type="checkbox" name="wf-vis-weekday" value="thu" /><span class="wf-vis-weekday-initial">Th</span></label>
                        <label class="wf-vis-weekday-block"><input type="checkbox" name="wf-vis-weekday" value="fri" /><span class="wf-vis-weekday-initial">Fr</span></label>
                        <label class="wf-vis-weekday-block"><input type="checkbox" name="wf-vis-weekday" value="sat" /><span class="wf-vis-weekday-initial">Sa</span></label>
                      </div>
                    </div>

                    <div class="wf-vis-triggers-section">
                      <div class="wf-vis-triggers-header-row">
                        <span class="wf-skill-field-label">Triggers</span>
                        <button type="button" class="wf-vis-trigger-add">Add Trigger</button>
                      </div>
                      <div class="wf-vis-trigger-list"></div>
                      <p class="wf-visibility-panel-hint wf-vis-triggers-helper">The trigger will be passed as input to the process.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="wf-visibility-accordion-item">
                <button type="button" class="wf-visibility-accordion-trigger" aria-expanded="false" id="wf-vis-acc-who">
                  <span class="wf-visibility-accordion-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <span class="wf-visibility-accordion-label">Who does the job appear to</span>
                  <span class="wf-visibility-accordion-chevron" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="wf-visibility-accordion-panel" id="wf-vis-panel-who" hidden>
                  <div class="wf-visibility-panel-inner">
                    <p class="wf-visibility-panel-hint">Target roles, segments, or user groups.</p>
                    <label class="wf-skill-field-label" for="wf-vis-audience">Audience</label>
                    <select id="wf-vis-audience" class="wf-skill-text-input" multiple size="4">
                      <option>All authenticated users</option>
                      <option>Managers &amp; above</option>
                      <option>Procurement — full access</option>
                      <option>Finance approvers</option>
                    </select>
                    <p class="wf-visibility-panel-hint wf-visibility-panel-hint--sm">Hold Cmd/Ctrl to select multiple.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="wf-skill-config-footer">
          <button type="button" class="wf-skill-footer-btn wf-skill-footer-back">Back</button>
          <button type="button" class="wf-skill-footer-btn wf-skill-footer-done" disabled>Done</button>
        </div>

        <div class="wf-guardrails-sheet wf-hidden" aria-hidden="true">
          <button type="button" class="wf-guardrails-sheet-backdrop" aria-label="Close guardrails picker"></button>
          <div class="wf-guardrails-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="wf-guardrails-sheet-title">
            <div class="wf-guardrails-sheet-handle" aria-hidden="true"></div>
            <div class="wf-guardrails-sheet-header">
              <h3 class="wf-guardrails-sheet-title" id="wf-guardrails-sheet-title">Whatfix widgets &amp; content</h3>
              <button type="button" class="wf-guardrails-sheet-close" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p class="wf-guardrails-sheet-subtitle">Project <strong class="wf-guardrails-project-label">${meta.id}</strong> (${meta.label})</p>
            <div class="wf-guardrails-toolbar">
              <input type="search" class="wf-guardrails-search" placeholder="Search widgets and content…" autocomplete="off" />
            </div>
            <ul class="wf-guardrails-list"></ul>
            <div class="wf-guardrails-sheet-footer">
              <button type="button" class="wf-guardrails-sheet-done">Done</button>
            </div>
          </div>
        </div>

        <div class="wf-job-review-sheet wf-hidden" aria-hidden="true">
          <button type="button" class="wf-job-review-sheet-backdrop" aria-label="Close review"></button>
          <div class="wf-job-review-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="wf-job-review-sheet-title">
            <div class="wf-job-review-sheet-handle" aria-hidden="true"></div>
            <div class="wf-job-review-sheet-header">
              <h3 class="wf-job-review-sheet-title" id="wf-job-review-sheet-title">Review job</h3>
              <button type="button" class="wf-job-review-sheet-close" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p class="wf-job-review-sheet-subtitle">Confirm details before creating your job.</p>
            <div class="wf-job-review-sheet-body" id="wf-job-review-sheet-body" role="region" aria-label="Job summary"></div>
            <div class="wf-job-review-sheet-footer">
              <button type="button" class="wf-job-review-sheet-create">Create Job</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const urlInput = content.querySelector('.wf-skill-url-input');
    const urlCount = content.querySelector('.wf-url-count');
    if (urlInput && urlCount) {
      urlCount.textContent = String(urlInput.value.length);
    }

    initSkillConfigPanel(content, widgets);
  }

  function initSkillConfigPanel(content, widgets) {
    const tabs = content.querySelectorAll('[data-skill-tab]');
    const panels = content.querySelectorAll('[data-skill-panel]');
    const skillDoneBtn = content.querySelector('.wf-skill-footer-done');

    function isWhenSectionComplete() {
      const start = content.querySelector('#wf-vis-start')?.value;
      const end = content.querySelector('#wf-vis-end')?.value;
      const tStart = content.querySelector('#wf-vis-time-start')?.value;
      const tEnd = content.querySelector('#wf-vis-time-end')?.value;
      const tz = content.querySelector('#wf-vis-timezone')?.value;
      if (!start || !end || !tStart || !tEnd || !tz) return false;

      const interval = content.querySelector('#wf-vis-interval')?.value || 'daily';
      if (interval === 'daily') {
        const v = content.querySelector('#wf-vis-times-daily')?.value;
        return v !== '' && Number(v) >= 1;
      }
      if (interval === 'weekly') {
        const v = content.querySelector('#wf-vis-times-weekly')?.value;
        return v !== '' && Number(v) >= 1;
      }
      if (interval === 'monthly') {
        const v = content.querySelector('#wf-vis-times-monthly')?.value;
        return v !== '' && Number(v) >= 1;
      }
      if (interval === 'select-days') {
        return content.querySelectorAll('input[name="wf-vis-weekday"]:checked').length > 0;
      }
      return false;
    }

    function updateSkillFooterDoneState() {
      if (!skillDoneBtn) return;
      const url = content.querySelector('#wf-vis-url-patterns')?.value?.trim();
      const visibilityComplete = !!(url && isWhenSectionComplete());
      skillDoneBtn.disabled = !visibilityComplete;
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-skill-tab');
        tabs.forEach((t) => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        panels.forEach((p) => {
          const on = p.getAttribute('data-skill-panel') === id;
          p.classList.toggle('active', on);
          p.hidden = !on;
        });
        setTimeout(updateSkillFooterDoneState, 0);
      });
    });

    const sheetEl = content.querySelector('.wf-guardrails-sheet');
    const sheetBackdrop = content.querySelector('.wf-guardrails-sheet-backdrop');
    const sheetCloseBtn = content.querySelector('.wf-guardrails-sheet-close');
    const sheetDoneBtn = content.querySelector('.wf-guardrails-sheet-done');
    const listEl = content.querySelector('.wf-guardrails-list');
    const searchInput = content.querySelector('.wf-guardrails-search');
    const summaryInput = content.querySelector('.wf-guardrails-summary-input');
    const toggleBtn = content.querySelector('.wf-guardrails-toggle');
    const selected = new Set();
    let guardrailsEscHandler = null;

    function renderList(filter) {
      if (!listEl) return;
      const q = (filter || '').trim().toLowerCase();
      listEl.innerHTML = '';
      widgets.forEach((w) => {
        const hay = `${w.widgetType} ${w.title} ${w.content}`.toLowerCase();
        if (q && !hay.includes(q)) return;
        const li = document.createElement('li');
        li.className = 'wf-guardrails-item';
        const checked = selected.has(w.id) ? 'checked' : '';
        li.innerHTML = `
          <label class="wf-guardrails-row">
            <input type="checkbox" class="wf-guardrails-checkbox" data-widget-id="${w.id}" ${checked} />
            <span class="wf-guardrails-row-main">
              <span class="wf-guardrails-type">${w.widgetType}</span>
              <span class="wf-guardrails-title">${w.title}</span>
              <span class="wf-guardrails-content">${w.content}</span>
            </span>
          </label>
        `;
        listEl.appendChild(li);
      });
    }

    function syncSummary() {
      const titles = widgets.filter((w) => selected.has(w.id)).map((w) => `${w.widgetType}: ${w.title}`);
      summaryInput.value = titles.length ? titles.join('; ') : '';
    }

    listEl?.addEventListener('change', (e) => {
      const cb = e.target.closest('.wf-guardrails-checkbox');
      if (!cb) return;
      const id = cb.getAttribute('data-widget-id');
      if (cb.checked) selected.add(id);
      else selected.delete(id);
      syncSummary();
    });

    searchInput?.addEventListener('input', () => {
      renderList(searchInput.value);
      listEl?.querySelectorAll('.wf-guardrails-checkbox').forEach((cb) => {
        const id = cb.getAttribute('data-widget-id');
        cb.checked = selected.has(id);
      });
    });

    function openGuardrailsSheet() {
      if (!sheetEl) return;
      sheetEl.classList.remove('wf-hidden');
      sheetEl.setAttribute('aria-hidden', 'false');
      toggleBtn?.setAttribute('aria-expanded', 'true');
      toggleBtn?.closest('.wf-guardrails-block')?.classList.add('wf-guardrails-expanded');
      searchInput?.focus();
      if (guardrailsEscHandler) document.removeEventListener('keydown', guardrailsEscHandler, true);
      guardrailsEscHandler = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeGuardrailsSheet();
        }
      };
      document.addEventListener('keydown', guardrailsEscHandler, true);
    }

    function closeGuardrailsSheet() {
      if (!sheetEl) return;
      sheetEl.classList.add('wf-hidden');
      sheetEl.setAttribute('aria-hidden', 'true');
      toggleBtn?.setAttribute('aria-expanded', 'false');
      toggleBtn?.closest('.wf-guardrails-block')?.classList.remove('wf-guardrails-expanded');
      if (guardrailsEscHandler) {
        document.removeEventListener('keydown', guardrailsEscHandler, true);
        guardrailsEscHandler = null;
      }
    }

    toggleBtn?.addEventListener('click', () => {
      if (!sheetEl) return;
      if (sheetEl.classList.contains('wf-hidden')) openGuardrailsSheet();
      else closeGuardrailsSheet();
    });

    summaryInput?.addEventListener('click', () => openGuardrailsSheet());

    sheetBackdrop?.addEventListener('click', closeGuardrailsSheet);
    sheetCloseBtn?.addEventListener('click', closeGuardrailsSheet);
    sheetDoneBtn?.addEventListener('click', closeGuardrailsSheet);

    const reviewSheetEl = content.querySelector('.wf-job-review-sheet');
    const reviewBackdrop = content.querySelector('.wf-job-review-sheet-backdrop');
    const reviewCloseBtn = content.querySelector('.wf-job-review-sheet-close');
    const reviewBody = content.querySelector('#wf-job-review-sheet-body');
    const reviewCreateBtn = content.querySelector('.wf-job-review-sheet-create');
    let reviewEscHandler = null;

    function escapeHtml(str) {
      return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function buildJobReviewMarkup() {
      const skillUrl = content.querySelector('.wf-skill-url-input')?.value?.trim() || '—';
      const skillName = content.querySelector('#wf-skill-name')?.value?.trim() || '—';
      const skillPrompt = content.querySelector('#wf-skill-prompt')?.value?.trim() || '—';
      const skillCustom = content.querySelector('#wf-skill-custom')?.value?.trim() || '';
      const guardrails = content.querySelector('.wf-guardrails-summary-input')?.value?.trim() || '';

      const urlPatterns = content.querySelector('#wf-vis-url-patterns')?.value?.trim() || '—';
      const start = content.querySelector('#wf-vis-start')?.value || '—';
      const end = content.querySelector('#wf-vis-end')?.value || '—';
      const tStart = content.querySelector('#wf-vis-time-start')?.value || '—';
      const tEnd = content.querySelector('#wf-vis-time-end')?.value || '—';
      const tzEl = content.querySelector('#wf-vis-timezone');
      const tz = tzEl?.selectedOptions?.[0]?.textContent?.trim() || tzEl?.value || '—';
      const localTime = content.querySelector('#wf-vis-local-time')?.checked ? 'Yes' : 'No';

      const intervalVal = content.querySelector('#wf-vis-interval')?.value || 'daily';
      const intervalLabels = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', 'select-days': 'Select days' };
      const intervalLabel = intervalLabels[intervalVal] || intervalVal;

      let intervalExtra = '—';
      if (intervalVal === 'daily') {
        intervalExtra = content.querySelector('#wf-vis-times-daily')?.value || '—';
        intervalExtra = `Number of times daily: ${intervalExtra}`;
      } else if (intervalVal === 'weekly') {
        intervalExtra = content.querySelector('#wf-vis-times-weekly')?.value || '—';
        intervalExtra = `Number of times weekly: ${intervalExtra}`;
      } else if (intervalVal === 'monthly') {
        intervalExtra = content.querySelector('#wf-vis-times-monthly')?.value || '—';
        intervalExtra = `Number of times monthly: ${intervalExtra}`;
      } else if (intervalVal === 'select-days') {
        const dayMap = { sun: 'Su', mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa' };
        const days = Array.from(content.querySelectorAll('input[name="wf-vis-weekday"]:checked')).map(
          (cb) => dayMap[cb.value] || cb.value
        );
        intervalExtra = days.length ? `Days: ${days.join(', ')}` : '—';
      }

      const audienceEl = content.querySelector('#wf-vis-audience');
      const audience =
        audienceEl && audienceEl.selectedOptions?.length
          ? Array.from(audienceEl.selectedOptions).map((o) => o.textContent).join(', ')
          : '—';

      const sec = (title, inner) =>
        `<section class="wf-job-review-block"><h4 class="wf-job-review-block-title">${escapeHtml(title)}</h4>${inner}</section>`;
      const row = (label, val) =>
        `<div class="wf-job-review-item"><span class="wf-job-review-item-label">${escapeHtml(label)}</span><span class="wf-job-review-item-value">${escapeHtml(val)}</span></div>`;
      const rowMultiline = (label, val) =>
        `<div class="wf-job-review-item wf-job-review-item--stack"><span class="wf-job-review-item-label">${escapeHtml(label)}</span><span class="wf-job-review-item-value wf-job-review-item-value--multiline">${escapeHtml(val)}</span></div>`;

      return (
        sec(
          'Configuration',
          row('Page URL', skillUrl) +
            row('Skill name', skillName) +
            rowMultiline('Skill prompt', skillPrompt) +
            (skillCustom ? rowMultiline('Custom instructions', skillCustom) : '') +
            row('Guardrails', guardrails || 'None selected')
        ) +
        sec(
          'Visibility',
          row('URL patterns', urlPatterns) +
            row('Start date', start) +
            row('End date', end) +
            row('Start time', tStart) +
            row('End time', tEnd) +
            row('Timezone', tz) +
            row('Show schedule in local time', localTime) +
            row('Interval', intervalLabel) +
            row('Schedule detail', intervalExtra) +
            row('Audience', audience)
        )
      );
    }

    function openJobReviewSheet() {
      if (!reviewSheetEl || !reviewBody) return;
      closeGuardrailsSheet();
      reviewBody.innerHTML = buildJobReviewMarkup();
      reviewBody.scrollTop = 0;
      reviewSheetEl.classList.remove('wf-hidden');
      reviewSheetEl.setAttribute('aria-hidden', 'false');
      if (reviewEscHandler) document.removeEventListener('keydown', reviewEscHandler, true);
      reviewEscHandler = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeJobReviewSheet();
        }
      };
      document.addEventListener('keydown', reviewEscHandler, true);
      setTimeout(() => reviewCreateBtn?.focus(), 0);
    }

    function closeJobReviewSheet() {
      if (!reviewSheetEl) return;
      reviewSheetEl.classList.add('wf-hidden');
      reviewSheetEl.setAttribute('aria-hidden', 'true');
      if (reviewEscHandler) {
        document.removeEventListener('keydown', reviewEscHandler, true);
        reviewEscHandler = null;
      }
    }

    reviewBackdrop?.addEventListener('click', closeJobReviewSheet);
    reviewCloseBtn?.addEventListener('click', closeJobReviewSheet);
    reviewCreateBtn?.addEventListener('click', () => {
      console.log('Seek: Create Job — job configuration submitted (demo)');
      closeJobReviewSheet();
      openJobSuccessModal();
    });

    content.querySelector('.wf-skill-footer-back')?.addEventListener('click', () => {
      handleSeekAction('record', { resume: true });
    });

    skillDoneBtn?.addEventListener('click', () => {
      if (skillDoneBtn.disabled) return;
      openJobReviewSheet();
    });

    content.addEventListener('input', (e) => {
      if (e.target.closest('[data-skill-panel="visibility"]')) updateSkillFooterDoneState();
    });
    content.addEventListener('change', (e) => {
      if (e.target.closest('[data-skill-panel="visibility"]')) updateSkillFooterDoneState();
    });

    content.querySelectorAll('.wf-visibility-accordion-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.wf-visibility-accordion-item');
        const panel = item?.querySelector('.wf-visibility-accordion-panel');
        if (!item || !panel) return;
        const expanded = !item.classList.contains('wf-visibility-accordion-expanded');
        item.classList.toggle('wf-visibility-accordion-expanded', expanded);
        trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        panel.hidden = !expanded;
        setTimeout(updateSkillFooterDoneState, 0);
      });
    });

    function syncVisIntervalPanels() {
      const sel = content.querySelector('#wf-vis-interval');
      const v = sel && sel.value ? sel.value : 'daily';
      content.querySelectorAll('.wf-vis-interval-detail').forEach((el) => {
        const interval = el.getAttribute('data-vis-interval');
        el.hidden = interval !== v;
      });
    }

    const visTriggerList = content.querySelector('.wf-vis-trigger-list');
    const addTriggerBtn = content.querySelector('.wf-vis-trigger-add');
    const triggerTypes = [
      'Email Received',
      'Support Ticket Created',
      'Support Ticket Status Changed',
      'Form Submission',
      'Spreadsheet Row Added',
      'CRM Record Created / Updated',
      'Scheduled / Cron',
      'File Uploaded',
      'Webhook / API Call',
      'Manual Trigger',
      'Slack / Teams Message'
    ];
    let triggerSeq = 1;
    const triggerState = [];

    function triggerTypeOptionsHtml(selectedType) {
      return triggerTypes
        .map((type) => `<option value="${type}" ${selectedType === type ? 'selected' : ''}>${type}</option>`)
        .join('');
    }

    function triggerContextFieldsHtml(type, id) {
      if (type === 'Email Received') {
        return `
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-email-account-${id}">Email account</label>
            <select id="wf-trigger-email-account-${id}" class="wf-skill-text-input">
              <option>Support Inbox</option>
              <option>Operations Inbox</option>
              <option>Personal Work Email</option>
            </select>
          </div>
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-email-subject-${id}">Filter by subject contains</label>
            <input type="text" id="wf-trigger-email-subject-${id}" class="wf-skill-text-input" placeholder="e.g. Escalation, invoice, approval" />
          </div>
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-email-sender-${id}">Filter by sender</label>
            <input type="text" id="wf-trigger-email-sender-${id}" class="wf-skill-text-input" placeholder="e.g. support@acme.com" />
          </div>
        `;
      }

      if (type === 'Support Ticket Created' || type === 'Support Ticket Status Changed') {
        return `
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-support-platform-${id}">Platform</label>
            <select id="wf-trigger-support-platform-${id}" class="wf-skill-text-input">
              <option>Zendesk</option>
              <option>Freshdesk</option>
            </select>
          </div>
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-support-on-${id}">Trigger on</label>
            <select id="wf-trigger-support-on-${id}" class="wf-skill-text-input">
              <option value="created" ${type === 'Support Ticket Created' ? 'selected' : ''}>Created</option>
              <option value="status-changed" ${type === 'Support Ticket Status Changed' ? 'selected' : ''}>Status changed</option>
              <option value="assigned">Assigned</option>
            </select>
          </div>
        `;
      }

      if (type === 'Scheduled / Cron') {
        return `
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-schedule-interval-${id}">Frequency</label>
            <select id="wf-trigger-schedule-interval-${id}" class="wf-skill-text-input">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="select-days">Select days</option>
            </select>
          </div>
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-schedule-time-${id}">Time</label>
            <input type="time" id="wf-trigger-schedule-time-${id}" class="wf-skill-text-input" />
          </div>
        `;
      }

      if (type === 'Webhook / API Call') {
        return `
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-webhook-url-${id}">Webhook URL</label>
            <div class="wf-vis-trigger-webhook-row">
              <input type="text" id="wf-trigger-webhook-url-${id}" class="wf-skill-text-input" readonly value="https://hooks.seek.whatfix.dev/trigger/${id}" />
              <button type="button" class="wf-vis-trigger-copy" data-copy-target="wf-trigger-webhook-url-${id}">Copy</button>
            </div>
          </div>
        `;
      }

      if (type === 'Manual Trigger') {
        return `<p class="wf-visibility-panel-hint">This process will be triggered manually by a user.</p>`;
      }

      return `
        <div class="wf-skill-field">
          <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-connection-${id}">Connection / Account</label>
          <select id="wf-trigger-connection-${id}" class="wf-skill-text-input">
            <option>Primary workspace</option>
            <option>Operations workspace</option>
            <option>Sandbox workspace</option>
          </select>
        </div>
        <div class="wf-skill-field">
          <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-filter-${id}">Filter / Condition (optional)</label>
          <input type="text" id="wf-trigger-filter-${id}" class="wf-skill-text-input" placeholder="Optional filter expression" />
        </div>
      `;
    }

    function triggerCardHtml(id, type) {
      return `
        <div class="wf-vis-trigger-card" data-trigger-id="${id}">
          <div class="wf-vis-trigger-card-head">
            <label class="wf-skill-field-label" for="wf-trigger-type-${id}">Trigger type</label>
            <button type="button" class="wf-vis-trigger-remove" aria-label="Remove trigger">Remove</button>
          </div>
          <div class="wf-skill-field">
            <select id="wf-trigger-type-${id}" class="wf-skill-text-input wf-vis-trigger-type">
              ${triggerTypeOptionsHtml(type)}
            </select>
          </div>
          <div class="wf-vis-trigger-context">
            ${triggerContextFieldsHtml(type, id)}
          </div>
          <div class="wf-skill-field">
            <label class="wf-skill-field-label wf-skill-field-label--sub" for="wf-trigger-only-if-${id}">Only trigger if...</label>
            <input type="text" id="wf-trigger-only-if-${id}" class="wf-skill-text-input" placeholder="Optional condition / filter" />
          </div>
        </div>
      `;
    }

    function appendTriggerCard(item) {
      if (!visTriggerList || !item) return;
      visTriggerList.insertAdjacentHTML('beforeend', triggerCardHtml(item.id, item.type));
    }

    function ensureAtLeastOneTrigger() {
      if (triggerState.length > 0) return;
      const item = { id: triggerSeq++, type: 'Email Received' };
      triggerState.push(item);
      appendTriggerCard(item);
    }

    addTriggerBtn?.addEventListener('click', () => {
      const item = { id: triggerSeq++, type: 'Email Received' };
      triggerState.push(item);
      appendTriggerCard(item);
      updateSkillFooterDoneState();
    });

    visTriggerList?.addEventListener('change', (e) => {
      const typeSel = e.target.closest('.wf-vis-trigger-type');
      if (!typeSel) return;
      const card = typeSel.closest('.wf-vis-trigger-card');
      if (!card) return;
      const id = card.getAttribute('data-trigger-id');
      const context = card.querySelector('.wf-vis-trigger-context');
      if (!id || !context) return;
      const st = triggerState.find((s) => s.id === Number(id));
      if (st) st.type = typeSel.value;
      context.innerHTML = triggerContextFieldsHtml(typeSel.value, id);
      updateSkillFooterDoneState();
    });

    visTriggerList?.addEventListener('click', async (e) => {
      const rm = e.target.closest('.wf-vis-trigger-remove');
      if (rm) {
        const card = rm.closest('.wf-vis-trigger-card');
        const id = card?.getAttribute('data-trigger-id');
        if (id) {
          const i = triggerState.findIndex((s) => s.id === Number(id));
          if (i >= 0) triggerState.splice(i, 1);
          card?.remove();
          ensureAtLeastOneTrigger();
          updateSkillFooterDoneState();
        }
        return;
      }
      const copyBtn = e.target.closest('.wf-vis-trigger-copy');
      if (!copyBtn) return;
      const targetId = copyBtn.getAttribute('data-copy-target');
      const input = targetId ? content.querySelector(`#${targetId}`) : null;
      if (!input) return;
      try {
        await navigator.clipboard.writeText(input.value || '');
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
          copyBtn.textContent = prev;
        }, 1200);
      } catch (err) {
        console.warn('Copy failed:', err);
      }
    });

    ensureAtLeastOneTrigger();

    content.querySelector('#wf-vis-interval')?.addEventListener('change', () => {
      syncVisIntervalPanels();
      updateSkillFooterDoneState();
    });
    syncVisIntervalPanels();

    renderList('');
    syncSummary();
    updateSkillFooterDoneState();
  }

  function handleSeekAction(action, opts) {
    const content = studioOverlay.querySelector('.wf-studio-content');
    const resume = opts && opts.resume;
    
    switch(action) {
      case 'record':
        content.innerHTML = `
          <div class="wf-seek-panel wf-capture-panel">
            <div class="wf-url-input-group wf-url-input-group--capture">
              <label class="wf-url-label">
                <span>URL</span>
                <span class="wf-url-counter"><span class="wf-url-count">0</span>/100</span>
              </label>
              <input type="text" class="wf-url-input" value="${window.location.href}" disabled />
            </div>

            <div class="wf-capture-scroll">
              <div class="wf-captured-steps">
                <!-- Captured steps will be added here dynamically -->
              </div>
              
              <div class="wf-capture-empty-state">
                <p>Click on elements in the application to capture steps</p>
              </div>
            </div>

            <div class="wf-capture-panel-footer wf-capture-next-hidden">
              <button type="button" class="wf-capture-next-btn">Next</button>
            </div>
          </div>
        `;
        
        initCaptureMode(content, { resume });
        break;
        
      case 'describe':
        content.innerHTML = `
          <div class="wf-seek-panel">
            <button class="wf-back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Back
            </button>
            
            <div class="wf-describe-panel">
              <h3>Describe Your Automation</h3>
              <p>Tell us what you want to automate in plain language</p>
              
              <textarea class="wf-describe-input" placeholder="Example: Create a new purchase requisition for office supplies, fill in the department as 'Marketing', set priority to 'High', and submit for approval..."></textarea>
              
              <button class="wf-generate-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Generate Automation
              </button>
            </div>
          </div>
        `;
        break;
        
      case 'template':
        content.innerHTML = `
          <div class="wf-seek-panel">
            <button class="wf-back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Back
            </button>
            
            <div class="wf-template-panel">
              <h3>Choose a Template</h3>
              
              <div class="wf-template-list">
                <button class="wf-template-item">
                  <div class="wf-template-icon">📋</div>
                  <div class="wf-template-info">
                    <h4>Create Purchase Requisition</h4>
                    <p>Automate the creation of new purchase requests</p>
                  </div>
                </button>
                
                <button class="wf-template-item">
                  <div class="wf-template-icon">✅</div>
                  <div class="wf-template-info">
                    <h4>Approve Requisition</h4>
                    <p>Streamline the approval workflow</p>
                  </div>
                </button>
                
                <button class="wf-template-item">
                  <div class="wf-template-icon">📊</div>
                  <div class="wf-template-info">
                    <h4>Generate Report</h4>
                    <p>Create automated reporting workflows</p>
                  </div>
                </button>
                
                <button class="wf-template-item">
                  <div class="wf-template-icon">🔔</div>
                  <div class="wf-template-info">
                    <h4>Send Notifications</h4>
                    <p>Automate notification triggers</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        `;
        break;
    }

    const backBtn = content.querySelector('.wf-back-btn');
    backBtn?.addEventListener('click', () => {
      showSeekPanel();
    });
  }

  // Capture mode variables
  let capturedSteps = [];
  let isCapturing = false;
  let captureClickHandler = null;

  /**
   * Capture the page without Whatfix Studio, crop & zoom around the click, draw static highlight.
   * Returns a data URL or null if html2canvas is unavailable or capture fails.
   */
  async function captureZoomedScreenshot(pageX, pageY) {
    if (typeof html2canvas !== 'function') {
      return null;
    }

    const ignoreStudio = (el) => {
      if (!el || el.nodeType !== 1) return false;
      if (el.id === 'whatfix-studio-overlay') return true;
      return !!(el.closest && el.closest('#whatfix-studio-overlay'));
    };

    // Let the click paint finish, then capture the page without the Studio DOM
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

    let canvas;
    try {
      canvas = await html2canvas(document.documentElement, {
        logging: false,
        useCORS: true,
        allowTaint: false,
        scale: Math.min(2, window.devicePixelRatio || 1),
        ignoreElements: ignoreStudio
      });
    } catch (err) {
      console.warn('Capture screenshot failed:', err);
      return null;
    }

    const docEl = document.documentElement;
    const sw = Math.max(docEl.scrollWidth, 1);
    const sh = Math.max(docEl.scrollHeight, 1);
    const scaleX = canvas.width / sw;
    const scaleY = canvas.height / sh;

    const px = pageX * scaleX;
    const py = pageY * scaleY;

    const cropW = Math.min(canvas.width, Math.max(220, canvas.width * 0.35));
    const cropH = Math.min(canvas.height, Math.max(180, canvas.height * 0.28));

    let sx = px - cropW / 2;
    let sy = py - cropH / 2;
    sx = Math.max(0, Math.min(sx, canvas.width - cropW));
    sy = Math.max(0, Math.min(sy, canvas.height - cropH));

    const outW = 520;
    const outH = Math.max(120, Math.round(cropH * (outW / cropW)));

    /* Wider “context” crop for zoom-in animation in Seek (base → click region) */
    const ZOOM_CTX = 2.35;
    let cropW_wide = Math.min(canvas.width, cropW * ZOOM_CTX);
    let cropH_wide = Math.min(canvas.height, cropH * ZOOM_CTX);
    let sx_wide = px - cropW_wide / 2;
    let sy_wide = py - cropH_wide / 2;
    sx_wide = Math.max(0, Math.min(sx_wide, canvas.width - cropW_wide));
    sy_wide = Math.max(0, Math.min(sy_wide, canvas.height - cropH_wide));

    const outWide = document.createElement('canvas');
    outWide.width = outW;
    outWide.height = outH;
    outWide.getContext('2d').drawImage(canvas, sx_wide, sy_wide, cropW_wide, cropH_wide, 0, 0, outW, outH);
    const wideDataUrl = outWide.toDataURL('image/png');

    const originX = ((px - sx_wide) / cropW_wide) * 100;
    const originY = ((py - sy_wide) / cropH_wide) * 100;
    const zoomScale = Math.max(1.25, cropW_wide / cropW);

    const out = document.createElement('canvas');
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, sx, sy, cropW, cropH, 0, 0, outW, outH);

    const cx = ((px - sx) / cropW) * outW;
    const cy = ((py - sy) / cropH) * outH;
    const r = 26;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();

    try {
      return {
        finalUrl: out.toDataURL('image/png'),
        wideUrl: wideDataUrl,
        originX,
        originY,
        zoomScale
      };
    } catch (e) {
      return null;
    }
  }

  function updateCaptureNextFooterVisibility() {
    const footer = studioOverlay?.querySelector('.wf-capture-panel-footer');
    if (!footer) return;
    if (capturedSteps.length > 0) {
      footer.classList.remove('wf-capture-next-hidden');
    } else {
      footer.classList.add('wf-capture-next-hidden');
    }
  }

  function initCaptureMode(content, opts) {
    const resume = opts && opts.resume;
    if (!resume) {
      capturedSteps = [];
    }
    isCapturing = true;
    
    const stepsContainer = content.querySelector('.wf-captured-steps');
    const emptyState = content.querySelector('.wf-capture-empty-state');
    const urlInput = content.querySelector('.wf-url-input');
    const urlCount = content.querySelector('.wf-url-count');
    if (urlInput && urlCount) {
      urlCount.textContent = String(urlInput.value.length);
    }

    if (resume && capturedSteps.length > 0) {
      if (emptyState) emptyState.style.display = 'none';
      capturedSteps.forEach((sd) => {
        const card = addStepCard(stepsContainer, sd, {
          loading: !sd.screenshotPayload,
          resume: true
        });
        if (sd.screenshotPayload) {
          updateStepCardScreenshot(card, sd.screenshotPayload);
        }
      });
      updateCaptureNextFooterVisibility();
    }

    const nextBtn = content.querySelector('.wf-capture-next-btn');
    nextBtn?.addEventListener('click', () => {
      if (capturedSteps.length === 0) return;
      stopCaptureMode();
      showSkillConfigPanel();
    });

    document.body.classList.add('wf-capture-mode');
    showCaptureMinibar();

    // Listen for clicks on the document (underlying application — studio excluded)
    captureClickHandler = (e) => {
      if (!isCapturing) return;
      
      // Ignore clicks within the studio overlay
      if (e.target.closest('#whatfix-studio-overlay')) return;

      const pageX = e.pageX;
      const pageY = e.pageY;
      
      const clickedElement = e.target;
      const elementText = clickedElement.textContent?.trim().substring(0, 30) || clickedElement.tagName;
      const stepNumber = capturedSteps.length + 1;
      
      const stepData = {
        id: Date.now(),
        number: stepNumber,
        action: 'Click',
        target: elementText,
        description: '',
        timestamp: new Date().toISOString()
      };
      
      capturedSteps.push(stepData);
      
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      
      const stepCard = addStepCard(stepsContainer, stepData, { loading: true });

      captureZoomedScreenshot(pageX, pageY).then((payload) => {
        updateStepCardScreenshot(stepCard, payload);
        const st = capturedSteps.find((s) => s.id === stepData.id);
        if (st && payload) st.screenshotPayload = payload;
      });

      updateCaptureNextFooterVisibility();
    };
    
    document.addEventListener('click', captureClickHandler, true);
  }

  function stopCaptureMode() {
    isCapturing = false;
    hideCaptureMinibar();
    document.body.classList.remove('wf-capture-mode');
    if (captureClickHandler) {
      document.removeEventListener('click', captureClickHandler, true);
      captureClickHandler = null;
    }
  }

  function updateStepCardScreenshot(stepCard, payload) {
    const host = stepCard.querySelector('.wf-step-screenshot');
    if (!host) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!payload) {
      host.innerHTML = `
        <div class="wf-screenshot-frame wf-screenshot-fallback">
          <span class="wf-screenshot-label">Screenshot unavailable (load html2canvas for capture)</span>
        </div>
      `;
      return;
    }

    const legacy = typeof payload === 'string';
    const finalUrl = legacy ? payload : payload.finalUrl;
    const wideUrl = !legacy && payload.wideUrl ? payload.wideUrl : null;

    if (!finalUrl) {
      host.innerHTML = `
        <div class="wf-screenshot-frame wf-screenshot-fallback">
          <span class="wf-screenshot-label">Screenshot unavailable (load html2canvas for capture)</span>
        </div>
      `;
      return;
    }

    if (legacy || !wideUrl || reducedMotion) {
      host.innerHTML = `
        <div class="wf-screenshot-frame">
          <img class="wf-screenshot-img" src="${finalUrl}" alt="Captured area around click" />
        </div>
      `;
      return;
    }

    const { originX, originY, zoomScale } = payload;
    host.innerHTML = `
      <div class="wf-screenshot-frame wf-screenshot-reveal">
        <div class="wf-screenshot-zoom-stage">
          <img class="wf-screenshot-img wf-screenshot-wide" src="${wideUrl}" alt="" aria-hidden="true"
            style="transform-origin:${originX}% ${originY}%;--wf-zoom:${zoomScale}" />
          <img class="wf-screenshot-img wf-screenshot-final" src="${finalUrl}" alt="Captured area around click" />
        </div>
      </div>
    `;
  }

  function addStepCard(container, stepData, options) {
    const loading = options && options.loading;
    const stepCard = document.createElement('div');
    stepCard.className = 'wf-step-card';
    stepCard.dataset.stepId = stepData.id;
    
    stepCard.innerHTML = `
      <div class="wf-step-header">
        <div class="wf-step-title">
          <span class="wf-step-number">${stepData.number}</span>
          <span class="wf-step-action">${stepData.action} on ${stepData.target}</span>
        </div>
        <div class="wf-step-actions">
          <button class="wf-step-delete-btn" title="Delete step">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          <button class="wf-step-more-btn" title="More options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="wf-step-screenshot">
        <div class="wf-screenshot-frame wf-screenshot-loading">
          ${loading ? '<span class="wf-screenshot-loading-text">Capturing page (without Studio)…</span>' : ''}
        </div>
      </div>
      
      <div class="wf-step-description">
        <label>Description</label>
        <input type="text" class="wf-step-desc-input" placeholder="Describe the step" value="${stepData.description}" />
      </div>
    `;
    
    // Add event listeners
    const deleteBtn = stepCard.querySelector('.wf-step-delete-btn');
    deleteBtn?.addEventListener('click', () => {
      deleteStep(stepData.id, stepCard);
    });
    
    const descInput = stepCard.querySelector('.wf-step-desc-input');
    descInput?.addEventListener('input', (e) => {
      const step = capturedSteps.find(s => s.id === stepData.id);
      if (step) {
        step.description = e.target.value;
      }
    });
    
    container.appendChild(stepCard);
    
    if (!options || !options.resume) {
      stepCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    return stepCard;
  }

  function deleteStep(stepId, stepCard) {
    capturedSteps = capturedSteps.filter(s => s.id !== stepId);
    stepCard.remove();
    
    // Renumber remaining steps
    const container = studioOverlay.querySelector('.wf-captured-steps');
    const cards = container?.querySelectorAll('.wf-step-card');
    cards?.forEach((card, index) => {
      const numberEl = card.querySelector('.wf-step-number');
      if (numberEl) {
        numberEl.textContent = index + 1;
      }
      const step = capturedSteps[index];
      if (step) {
        step.number = index + 1;
      }
    });
    
    // Show empty state if no steps
    if (capturedSteps.length === 0) {
      const emptyState = studioOverlay.querySelector('.wf-capture-empty-state');
      if (emptyState) {
        emptyState.style.display = 'block';
      }
    }

    updateCaptureNextFooterVisibility();
  }

  function resetToMainView() {
    window.dispatchEvent(new CustomEvent('wf-flow-studio-reset'));
    flowEditorState.hasTimelineUi = false;
    flowEditorState.flowSteps = [];
    flowEditorState.pendingReselectStepId = null;
    if (studioOverlay) {
      studioOverlay.remove();
      studioOverlay = null;
    }
    createStudioOverlay();
    toggleStudio(true);
  }

  function toggleStudio(show) {
    if (!studioOverlay) {
      createStudioOverlay();
    }
    
    if (show === undefined) {
      studioOverlay.classList.toggle('wf-hidden');
      isStudioOpen = !studioOverlay.classList.contains('wf-hidden');
    } else {
      if (show) {
        studioOverlay.classList.remove('wf-hidden');
        isStudioOpen = true;
      } else {
        studioOverlay.classList.add('wf-hidden');
        isStudioOpen = false;
      }
    }
  }

  // Listen for messages from parent window
  window.addEventListener('message', (event) => {
    // Only process messages with a type property
    if (!event.data || typeof event.data !== 'object' || !event.data.type) {
      return;
    }
    
    console.log('Received message in iframe, type:', event.data.type);
    
    if (event.data.type === 'WHATFIX_STUDIO_TOGGLE') {
      console.log('Toggling studio');
      toggleStudio();
    } else if (event.data.type === 'OPEN_STUDIO') {
      console.log('Opening studio');
      toggleStudio(true);
    } else if (event.data.type === 'CLOSE_STUDIO') {
      console.log('Closing studio');
      toggleStudio(false);
    } else if (event.data.type === 'OPEN_SEEK') {
      console.log('Opening seek panel');
      toggleStudio(true);
      setTimeout(() => {
        showSeekPanel();
      }, 100);
    }
  });
  
  console.log('Studio overlay script loaded, in iframe:', window.self !== window.top);

  window.addEventListener('wf-flow-element-selected', (e) => {
    const detail = e.detail && typeof e.detail === 'object' ? e.detail : {};
    const label = detail.label ? String(detail.label).trim() : '';
    const pickToken = detail.pickToken != null ? detail.pickToken : null;
    const mode = detail.mode || 'step';

    if (mode === 'smartTipAnchor' && smartTipAnchorPickBridge && label) {
      const bridge = smartTipAnchorPickBridge;
      smartTipAnchorPickBridge = null;
      popupEditorState = {
        widgetKind: bridge.widgetKind || 'smart-tip',
        typeId: bridge.typeId || 'anchored',
        templateId: bridge.templateId || 'anchored-1',
        content: {
          title: bridge.textValue || 'Smart tip',
          body: `Anchored to ${label}`,
          primaryCta: 'Learn more',
          secondaryCta: 'Later',
          tertiaryCta: 'Dismiss'
        },
        anchorLabel: label
      };
      endFlowStepSelectMode();
      showPopupConfigPanel();
      return;
    }

    if (mode === 'beaconAnchor' && beaconAnchorPickBridge && label) {
      const bridge = beaconAnchorPickBridge;
      beaconAnchorPickBridge = null;
      const typeId = bridge.typeId || 'pulse';
      const templateId = bridge.templateId || `${typeId}-1`;
      popupEditorState = {
        widgetKind: bridge.widgetKind || 'beacon',
        typeId: typeId,
        templateId: templateId,
        content: {
          title: bridge.textValue || 'Beacon',
          body: `Latched to ${label}`,
          primaryCta: 'Learn more',
          secondaryCta: 'Later',
          tertiaryCta: 'Dismiss'
        },
        anchorLabel: label,
        anchorPosition: detail.anchorPosition || null
      };
      endFlowStepSelectMode();
      showPopupConfigPanel();
      return;
    }

    if (mode === 'displayRule' && popupWhenElementPickBridge && label) {
      const bridge = popupWhenElementPickBridge;
      popupWhenElementPickBridge = null;
      try {
        if (typeof bridge.onPicked === 'function') bridge.onPicked(label);
      } catch (_err) {
        // no-op: keep studio resilient if callback throws
      }
      endFlowStepSelectMode();
      return;
    }

    if (mode === 'displayRule' && flowEditorState.displayRulePick && label) {
      const { stepId: drStepId, ruleId } = flowEditorState.displayRulePick;
      flowEditorState.displayRulePick = null;
      flowEditorState.flowSelectReturnToStepEditor = null;
      const st = flowEditorState.flowSteps.find((s) => s.id === drStepId);
      if (st && Array.isArray(st.displayRules)) {
        const rule = st.displayRules.find((r) => r.id === ruleId);
        if (rule) rule.targetLabel = label;
      }
      endFlowStepSelectMode();
      showFlowStepEditorPanel(drStepId, { openAdvancedTab: true });
      return;
    }

    const reselectId = flowEditorState.pendingReselectStepId;
    if (label && reselectId) {
      const existing = flowEditorState.flowSteps.find((s) => s.id === reselectId);
      if (existing) {
        existing.label = label;
      }
      flowEditorState.pendingReselectStepId = null;
    } else if (label) {
      flowEditorState.flowSteps.push({
        id: 'fs_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
        label,
        displayRules: []
      });
    }
    const n = flowEditorState.flowSteps.length;
    window.dispatchEvent(
      new CustomEvent('wf-flow-pick-meta', {
        detail: {
          label,
          pickToken,
          stepNumber: n,
          totalWithEnd: n + 1
        }
      })
    );
    endFlowStepSelectMode();
    showFlowPanel({ timeline: true });
  });

  // Initialize - create overlay
  createStudioOverlay();
  
  // Expose toggleStudio globally for direct access
  window.toggleStudio = toggleStudio;
  window.showSeekPanel = showSeekPanel;
  
  // Show overlay by default (user can close it)
  toggleStudio(true);
})();
