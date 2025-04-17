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
          '<div class="text-secondary mb-2">Date</div><h2 class="text-2xl mb-4 text-primary">How We Met</h2><p class="leading-relaxed">Share the story of how you first met. What were the circumstances? Was it by chance or through friends?</p>',
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
          '<div class="text-secondary mb-2">Date</div><h2 class="text-2xl mb-4 text-primary">The Proposal</h2><p class="leading-relaxed">Share the details of your proposal. Where did it happen? Was it a surprise? What made the moment special?</p>',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    }
  ]
};
