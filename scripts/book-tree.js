// Keep book structure independent of filenames and chapter numbering.
hexo.extend.helper.register('book_tree', function (entries) {
  const roots = [];
  let part, chapter;
  for (const entry of entries) {
    if (entry.kind === 'home') continue;
    const node = { entry, children: [] };
    if (entry.kind === 'part') {
      roots.push(node); part = node; chapter = null;
    } else if (entry.kind === 'chapter') {
      (part ? part.children : roots).push(node); chapter = node;
    } else {
      (chapter ? chapter.children : part ? part.children : roots).push(node);
    }
  }
  return roots;
});
