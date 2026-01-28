import { marked } from 'marked';

/**
 * Text/Gallery Card — viewer for close reading (transcription + image) and markdown.
 */
export function createTextCard(container, options = {}) {
  const {
    title = '',
    markdown = '',
    image = null,
    imageAlt = '',
    transcription = '',
  } = options;

  const card = document.createElement('div');
  card.className = 'card text-card';

  if (title) {
    const titleEl = document.createElement('p');
    titleEl.className = 'card-title';
    titleEl.textContent = title;
    card.appendChild(titleEl);
  }

  // Close reading mode: image + transcription side by side
  if (image && transcription) {
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-md);';

    const imgDiv = document.createElement('div');
    const img = document.createElement('img');
    img.src = image;
    img.alt = imageAlt || 'Document image';
    img.style.cssText = 'width:100%;height:auto;border-radius:var(--radius);';
    img.loading = 'lazy';
    imgDiv.appendChild(img);

    const textDiv = document.createElement('div');
    textDiv.innerHTML = marked.parse(transcription);
    textDiv.style.cssText = 'font-size:0.95rem;line-height:1.8;';

    grid.appendChild(imgDiv);
    grid.appendChild(textDiv);
    card.appendChild(grid);
  } else if (image) {
    const img = document.createElement('img');
    img.src = image;
    img.alt = imageAlt || 'Narrative image';
    img.style.cssText = 'width:100%;height:auto;border-radius:var(--radius);margin-bottom:var(--spacing-sm);';
    img.loading = 'lazy';
    card.appendChild(img);
  }

  // Markdown content
  if (markdown) {
    const mdDiv = document.createElement('div');
    mdDiv.className = 'markdown-content';
    mdDiv.innerHTML = marked.parse(markdown);
    card.appendChild(mdDiv);
  }

  container.innerHTML = '';
  container.appendChild(card);

  return card;
}

/**
 * Render a gallery of data-driven images from CSV rows.
 */
export function createGalleryCard(container, rows, options = {}) {
  const {
    imageColumn = 'image_url',
    captionColumn = 'title',
    altColumn = 'alt_text',
    title = 'Gallery',
  } = options;

  const card = document.createElement('div');
  card.className = 'card';

  const titleEl = document.createElement('p');
  titleEl.className = 'card-title';
  titleEl.textContent = title;
  card.appendChild(titleEl);

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--spacing-sm);';

  for (const row of rows) {
    const url = row[imageColumn];
    if (!url) continue;

    const item = document.createElement('figure');
    item.style.cssText = 'margin:0;';

    const img = document.createElement('img');
    img.src = url;
    img.alt = row[altColumn] || row[captionColumn] || 'Data image';
    img.style.cssText = 'width:100%;height:auto;border-radius:var(--radius);';
    img.loading = 'lazy';
    item.appendChild(img);

    if (row[captionColumn]) {
      const caption = document.createElement('figcaption');
      caption.textContent = row[captionColumn];
      caption.style.cssText = 'font-size:0.8rem;color:var(--color-text-muted);margin-top:var(--spacing-xs);';
      item.appendChild(caption);
    }

    grid.appendChild(item);
  }

  card.appendChild(grid);
  container.innerHTML = '';
  container.appendChild(card);

  return card;
}
