export const lodgingTemplate = {
  name: 'Lodging',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Lodging Options',
        subheading: '',
        imageId: null,
        textColor: 'light',
        height: 'medium',
        textAlignment: 'center'
      }
    },
    {
      type: 'text_image_right',
      data: {
        content:
          '<h2 class="text-2xl mb-6 text-center md:text-left text-primary">Melrose River Club</h2><div class="space-y-4 text-center md:text-left"><p class="text-xl">Boutique on the San Marcos River!</p><p class="font-medium">Don\'t be full by the sourroundings, the location is prime!</p></div>',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    },
    {
      type: 'spacer',
      data: {
        height: 'large'
      }
    },
    {
      type: 'text_image_left',
      data: {
        content:
          '<h2 class="text-2xl mb-6 text-center md:text-left text-primary">Crystal River Inn</h2><div class="space-y-4 text-center md:text-left"><p>The crystal river inn is a small B&B in San Marcos!</p><p class="text-secondary">Not associated with the wedding.</p></div>',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    }
  ]
};
