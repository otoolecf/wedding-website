export const lodgingTemplate = {
  name: 'Lodging',
  sections: [
    {
      type: 'HeroSection',
      data: {
        title: 'Accommodations',
        subtitle: 'Where to stay during the celebration',
        backgroundImage: null,
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        textColor: '#ffffff'
      }
    },
    {
      type: 'TextImageSection',
      data: {
        title: 'Hotel Block',
        content: 'Information about the hotel block and booking...',
        image: null,
        imagePosition: 'right',
        backgroundColor: '#ffffff'
      }
    },
    {
      type: 'ColumnsSection',
      data: {
        title: 'Room Options',
        columns: [
          {
            title: 'Standard Room',
            content: 'Details about standard room options...',
            icon: 'bed'
          },
          {
            title: 'Suite',
            content: 'Details about suite options...',
            icon: 'home'
          }
        ],
        backgroundColor: '#f9fafb'
      }
    },
    {
      type: 'TextSection',
      data: {
        title: 'Transportation',
        content: 'Information about getting to and from the venue...',
        alignment: 'center',
        backgroundColor: '#ffffff'
      }
    },
    {
      type: 'ButtonSection',
      data: {
        text: 'Book Your Room',
        link: '#',
        style: 'primary',
        alignment: 'center'
      }
    }
  ]
};
