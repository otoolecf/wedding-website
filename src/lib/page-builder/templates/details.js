export const detailsTemplate = {
  name: 'Wedding Details',
  sections: [
    {
      type: 'HeroSection',
      data: {
        title: 'Wedding Details',
        subtitle: 'Everything you need to know',
        backgroundImage: null,
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        textColor: '#ffffff'
      }
    },
    {
      type: 'ColumnsSection',
      data: {
        title: 'Date & Time',
        columns: [
          {
            title: 'Ceremony',
            content: 'Date and time details...',
            icon: 'calendar'
          },
          {
            title: 'Reception',
            content: 'Date and time details...',
            icon: 'clock'
          }
        ],
        backgroundColor: '#ffffff'
      }
    },
    {
      type: 'TextImageSection',
      data: {
        title: 'Location',
        content: 'Venue details and address...',
        image: null,
        imagePosition: 'right',
        backgroundColor: '#f9fafb'
      }
    },
    {
      type: 'TextSection',
      data: {
        title: 'Schedule',
        content: 'Detailed timeline of events...',
        alignment: 'center',
        backgroundColor: '#ffffff'
      }
    },
    {
      type: 'ButtonSection',
      data: {
        text: 'Add to Calendar',
        link: '#',
        style: 'primary',
        alignment: 'center'
      }
    }
  ]
};
