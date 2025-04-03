export const storyTemplate = {
  name: 'Our Story',
  sections: [
    {
      type: 'HeroSection',
      data: {
        title: 'Our Story',
        subtitle: 'How we met and fell in love',
        backgroundImage: null,
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        textColor: '#ffffff'
      }
    },
    {
      type: 'TextImageSection',
      data: {
        title: 'The Beginning',
        content: 'Share your story of how you first met...',
        image: null,
        imagePosition: 'right',
        backgroundColor: '#ffffff'
      }
    },
    {
      type: 'DividerSection',
      data: {
        style: 'dashed',
        color: '#e5e7eb'
      }
    },
    {
      type: 'TextImageSection',
      data: {
        title: 'The Proposal',
        content: 'Tell the story of your proposal...',
        image: null,
        imagePosition: 'left',
        backgroundColor: '#f9fafb'
      }
    },
    {
      type: 'GallerySection',
      data: {
        title: 'Our Journey',
        images: [],
        columns: 3,
        spacing: 'medium'
      }
    },
    {
      type: 'TextSection',
      data: {
        title: 'Looking Forward',
        content: 'Share your excitement for the future...',
        alignment: 'center',
        backgroundColor: '#ffffff'
      }
    }
  ]
};
