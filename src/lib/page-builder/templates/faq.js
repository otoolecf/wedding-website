export const faqTemplate = {
  name: 'FAQ',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Frequently Asked Questions',
        subheading: 'Everything you need to know',
        imageId: null,
        textColor: 'light',
        height: 'medium',
        textAlignment: 'center'
      }
    },
    {
      type: 'columns',
      data: {
        columns: [
          { content: '<p>Dress code information...</p>' },
          { content: '<p>Guest policy information...</p>' }
        ],
        count: '2',
        spacing: 'medium'
      }
    },
    {
      type: 'columns',
      data: {
        columns: [
          { content: '<p>Timing information...</p>' },
          { content: '<p>Parking information...</p>' }
        ],
        count: '2',
        spacing: 'medium'
      }
    },
    {
      type: 'text',
      data: {
        content: 'Feel free to reach out to us directly...'
      }
    }
  ]
};
