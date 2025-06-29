export const breakpointCols = (count: number) => {
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4; // Максимум 4 колонки
}