export const registryTemplate = {
  name: 'Registry',
  sections: [
    {
      type: 'HeroSection',
      data: {
        title: 'Registry',
        subtitle: 'Help us start our new life together',
        backgroundImage: null,
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        textColor: '#ffffff'
      }
    },
    {
      type: 'TextSection',
      data: {
        title: 'Our Registry',
        content: 'We are registered at the following stores...',
        alignment: 'center',
        backgroundColor: '#ffffff'
      }
    },
    {
      type: 'ColumnsSection',
      data: {
        title: 'Registry Links',
        columns: [
          {
            title: 'Store 1',
            content: 'Description of registry items...',
            icon: 'gift'
          },
          {
            title: 'Store 2',
            content: 'Description of registry items...',
            icon: 'gift'
          }
        ],
        backgroundColor: '#f9fafb'
      }
    },
    {
      type: 'ButtonSection',
      data: {
        text: 'View Registry',
        link: '#',
        style: 'primary',
        alignment: 'center'
      }
    },
    {
      type: 'TextSection',
      data: {
        title: 'Alternative Gifts',
        content: 'Information about alternative gift options...',
        alignment: 'center',
        backgroundColor: '#ffffff'
      }
    }
  ]
};
