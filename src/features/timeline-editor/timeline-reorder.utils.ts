/** Computes local preview order while dragging — does not mutate the document. */
export function computeDragPreview(
  originalSceneIds: string[],
  draggedSceneId: string,
  clientX: number,
  blockBounds: Map<string, DOMRect>,
): { previewSceneIds: string[]; targetIndex: number } {
  const remaining = originalSceneIds.filter((sceneId) => sceneId !== draggedSceneId);
  let insertIndex = remaining.length;

  for (let index = 0; index < remaining.length; index += 1) {
    const sceneId = remaining[index]!;
    const rect = blockBounds.get(sceneId);
    if (!rect) {
      continue;
    }

    const midpoint = rect.left + rect.width / 2;
    if (clientX < midpoint) {
      insertIndex = index;
      break;
    }
  }

  const previewSceneIds = [...remaining];
  previewSceneIds.splice(insertIndex, 0, draggedSceneId);

  return {
    previewSceneIds,
    targetIndex: insertIndex,
  };
}
