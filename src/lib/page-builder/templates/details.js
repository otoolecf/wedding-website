export const detailsTemplate = {
  name: 'Wedding Details',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Wedding Details',
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
          '<h2 class="text-2xl mb-6 text-center md:text-left">Wedding</h2><div class="space-y-4 text-center md:text-left"><p class="text-xl">4:00 PM</p><p>April 18, 2026</p><p class="font-medium">Windemere Farms</p><p class="text-gray-600">200 Windermere Rd, San Marcos, TX 78666</p></div>',
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
          '<h2 class="text-2xl mb-6 text-center md:text-left">Accommodation</h2><div class="space-y-4 text-center md:text-left"><p class="font-medium">Melrose River Club</p><p class="text-gray-600">70 Riverbend Dr, San Marcos, TX 78666</p><p>Booking Code: <span class="font-mono text-primary">WEDDING2026</span></p><p class="text-gray-600">Reserve your room!</p></div>',
        imageId: null,
        caption: '',
        imageWidth: '1/2',
        verticalAlignment: 'center'
      }
    }
  ]
};
