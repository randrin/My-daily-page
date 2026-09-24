import { CATEGORY_PALETTE, pickCategoryColor } from './category-color';

describe('pickCategoryColor', () => {
  it('renvoie une couleur de la palette', () => {
    for (let i = 0; i < 30; i += 1) {
      expect(CATEGORY_PALETTE).toContain(pickCategoryColor());
    }
  });
});
