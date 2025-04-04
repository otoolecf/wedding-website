export const lodgingTemplate = {
  name: 'Lodging',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Accommodations',
        subheading: 'Where to stay during the celebration',
        imageId: null,
        textColor: 'light',
        height: 'medium',
        textAlignment: 'center'
      }
    },
    {
      type: 'text_image_right',
      data: {
        content: 'Information about the hotel block and booking...',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    },
    {
      type: 'columns',
      data: {
        columns: [
          { content: '<p>Details about standard room options...</p>' },
          { content: '<p>Details about suite options...</p>' }
        ],
        count: '2',
        spacing: 'medium'
      }
    },
    {
      type: 'text',
      data: {
        content: 'Information about getting to and from the venue...'
      }
    },
    {
      type: 'button',
      data: {
        text: 'Book Your Room',
        link: '#',
        style: 'primary',
        alignment: 'center',
        size: 'medium'
      }
    }
  ]
};
