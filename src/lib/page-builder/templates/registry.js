export const registryTemplate = {
  name: 'Registry',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Registry',
        subheading: 'Help us start our new life together',
        imageId: null,
        textColor: 'light',
        height: 'medium',
        textAlignment: 'center'
      }
    },
    {
      type: 'text',
      data: {
        content: 'We are registered at the following stores...'
      }
    },
    {
      type: 'columns',
      data: {
        columns: [
          { content: '<p>Description of registry items...</p>' },
          { content: '<p>Description of registry items...</p>' }
        ],
        count: '2',
        spacing: 'medium'
      }
    },
    {
      type: 'button',
      data: {
        text: 'View Registry',
        link: '#',
        style: 'primary',
        alignment: 'center',
        size: 'medium'
      }
    },
    {
      type: 'text',
      data: {
        content: 'Information about alternative gift options...'
      }
    }
  ]
};
