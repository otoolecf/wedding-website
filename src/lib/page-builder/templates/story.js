export const storyTemplate = {
  name: 'Our Story',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Our Story',
        subheading: 'How we met and fell in love',
        imageId: null,
        textColor: 'light',
        height: 'medium',
        textAlignment: 'center'
      }
    },
    {
      type: 'text_image_right',
      data: {
        content: 'Share your story of how you first met...',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    },
    {
      type: 'divider',
      data: {
        style: 'dashed',
        width: 'wide',
        color: 'medium'
      }
    },
    {
      type: 'text_image_left',
      data: {
        content: 'Tell the story of your proposal...',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    },
    {
      type: 'gallery',
      data: {
        images: [],
        columns: '3',
        spacing: 'medium'
      }
    },
    {
      type: 'text',
      data: {
        content: 'Share your excitement for the future...'
      }
    }
  ]
};
