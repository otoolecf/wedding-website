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
          '<h2 class="text-2xl mb-6 text-center md:text-left text-primary">Primary Hotel</h2><div class="space-y-4 text-center md:text-left"><p class="text-xl">Recommended accommodation for guests</p><p class="font-medium">Add information about rooms, rates, and amenities here.</p></div>',
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
          '<h2 class="text-2xl mb-6 text-center md:text-left text-primary">Alternative Option</h2><div class="space-y-4 text-center md:text-left"><p>Additional accommodation options for guests.</p><p class="text-secondary">Provide relevant details about this location.</p></div>',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    }
  ]
};
