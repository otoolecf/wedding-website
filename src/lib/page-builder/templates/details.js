export const detailsTemplate = {
  name: 'Wedding Details',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Wedding Details',
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
          { content: '<p>Date and time details...</p>' },
          { content: '<p>Date and time details...</p>' }
        ],
        count: '2',
        spacing: 'medium'
      }
    },
    {
      type: 'text_image_right',
      data: {
        content: 'Venue details and address...',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    },
    {
      type: 'text',
      data: {
        content: 'Detailed timeline of events...'
      }
    },
    {
      type: 'button',
      data: {
        text: 'Add to Calendar',
        link: '#',
        style: 'primary',
        alignment: 'center',
        size: 'medium'
      }
    }
  ]
};
