export const faqTemplate = {
  name: 'FAQ',
  sections: [
    {
      type: 'HeroSection',
      data: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know',
        backgroundImage: null,
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        textColor: '#ffffff'
      }
    },
    {
      type: 'ColumnsSection',
      data: {
        title: 'Common Questions',
        columns: [
          {
            title: 'What should I wear?',
            content: 'Dress code information...',
            icon: 'clothes'
          },
          {
            title: 'Can I bring a plus one?',
            content: 'Guest policy information...',
            icon: 'people'
          }
        ],
        backgroundColor: '#ffffff'
      }
    },
    {
      type: 'ColumnsSection',
      data: {
        title: 'More Questions',
        columns: [
          {
            title: 'What time should I arrive?',
            content: 'Timing information...',
            icon: 'clock'
          },
          {
            title: 'Where should I park?',
            content: 'Parking information...',
            icon: 'car'
          }
        ],
        backgroundColor: '#f9fafb'
      }
    },
    {
      type: 'TextSection',
      data: {
        title: 'Still have questions?',
        content: 'Feel free to reach out to us directly...',
        alignment: 'center',
        backgroundColor: '#ffffff'
      }
    }
  ]
};
