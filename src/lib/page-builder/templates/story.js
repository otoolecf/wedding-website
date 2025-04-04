export const storyTemplate = {
  name: 'Our Story',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Our Story',
        subheading: '',
        imageId: null,
        textColor: 'light',
        height: 'medium',
        textAlignment: 'center'
      }
    },
    {
      type: 'text_image_right',
      data: {
        content:
          '<div class="text-secondary mb-2">Fall 2015</div><h2 class="text-2xl mb-4 text-primary">How We Met</h2><p class="leading-relaxed">An awkward waiting around aggregiously early to an 8 AM friday physics class</p>',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    },
    {
      type: 'spacer',
      data: {
        height: 'large'
      }
    },
    {
      type: 'text_image_left',
      data: {
        content:
          '<div class="text-secondary mb-2">August 26, 2024</div><h2 class="text-2xl mb-4 text-primary">The Proposal</h2><p class="leading-relaxed">After hours of driving with no food and a dissapointing stop at a closed Anderson\'s Pea Soup, a grumpy Colette went on a hike where Connor was walking too fast.</p>',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    }
  ]
};
