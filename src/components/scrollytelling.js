import scrollama from 'scrollama';
import { marked } from 'marked';

/**
 * Scrollytelling component — builds scroll-driven narrative layout from config.story.
 * Uses Scrollama.js to track scroll progress and trigger data transforms + view changes.
 */
export function initScrollytelling(narrativeContainer, story, callbacks = {}) {
  const {
    onStepEnter = () => {},
    onStepExit = () => {},
  } = callbacks;

  // Build layout: scrolling text on left, sticky visual on right
  const section = document.createElement('div');
  section.className = 'scroll-section container';

  const textColumn = document.createElement('div');
  textColumn.className = 'scroll-text';

  const visualColumn = document.createElement('div');
  visualColumn.className = 'scroll-visual';
  visualColumn.id = 'scroll-visual';

  // Build steps from story config
  for (let i = 0; i < story.length; i++) {
    const stepConfig = story[i];

    if (stepConfig.layout === 'full-width') {
      // Full-width narrative interlude — rendered outside the split layout
      const block = document.createElement('div');
      block.className = 'full-width-block step';
      block.dataset.stepIndex = i;
      block.innerHTML = marked.parse(stepConfig.text || '');

      if (stepConfig.image) {
        const img = document.createElement('img');
        img.src = stepConfig.image;
        img.alt = stepConfig.alt_text || 'Narrative image';
        img.style.cssText = 'width:100%;max-width:600px;margin:var(--spacing-md) auto;display:block;border-radius:var(--radius);';
        img.loading = 'lazy';
        block.appendChild(img);
      }

      textColumn.appendChild(block);
    } else {
      // Standard split-screen step
      const step = document.createElement('div');
      step.className = 'step';
      step.dataset.stepIndex = i;

      const content = document.createElement('div');
      content.innerHTML = marked.parse(stepConfig.text || '');
      step.appendChild(content);

      textColumn.appendChild(step);
    }
  }

  section.appendChild(textColumn);
  section.appendChild(visualColumn);
  narrativeContainer.innerHTML = '';
  narrativeContainer.appendChild(section);

  // Initialize Scrollama
  const scroller = scrollama();
  scroller
    .setup({
      step: '.step',
      offset: 0.5,
      debug: false,
    })
    .onStepEnter(response => {
      // Mark step as active
      document.querySelectorAll('.step').forEach(el => el.classList.remove('is-active'));
      response.element.classList.add('is-active');

      const stepIndex = parseInt(response.element.dataset.stepIndex, 10);
      const stepConfig = story[stepIndex];

      onStepEnter({
        index: stepIndex,
        element: response.element,
        direction: response.direction,
        config: stepConfig,
        visualContainer: visualColumn,
      });
    })
    .onStepExit(response => {
      const stepIndex = parseInt(response.element.dataset.stepIndex, 10);
      onStepExit({
        index: stepIndex,
        element: response.element,
        direction: response.direction,
      });
    });

  // Handle resize
  window.addEventListener('resize', scroller.resize);

  return { scroller, visualColumn, textColumn };
}
