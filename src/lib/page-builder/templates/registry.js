export const registryTemplate = {
  name: 'Registry',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'Registry',
        subheading: '',
        imageId: null,
        textColor: 'light',
        height: 'medium',
        textAlignment: 'center'
      }
    },
    {
      type: 'text',
      data: {
        content:
          '<p class="text-center max-w-2xl mx-auto mb-12">Your presence at our wedding is the greatest gift of all. However, for those who have asked, we\'ve created registries at the following stores:</p>'
      }
    },
    {
      type: 'columns',
      data: {
        columns: [
          {
            content:
              '<div class="bg-white p-6 rounded-lg text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"><img src="https://placehold.co/400x200?text=Registry+1" alt="Registry 1" class="w-full h-48 object-cover rounded mb-4"/><h2 class="text-xl font-medium mb-2 text-primary">Registry Name</h2><p class="text-secondary text-sm">Description of registry items</p></div>'
          },
          {
            content:
              '<div class="bg-white p-6 rounded-lg text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"><img src="https://placehold.co/400x200?text=Registry+2" alt="Registry 2" class="w-full h-48 object-cover rounded mb-4"/><h2 class="text-xl font-medium mb-2 text-primary">Registry Name</h2><p class="text-secondary text-sm">Description of registry items</p></div>'
          },
          {
            content:
              '<div class="bg-white p-6 rounded-lg text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"><img src="https://placehold.co/400x200?text=Registry+3" alt="Registry 3" class="w-full h-48 object-cover rounded mb-4"/><h2 class="text-xl font-medium mb-2 text-primary">Registry Name</h2><p class="text-secondary text-sm">Description of registry items</p></div>'
          }
        ],
        count: '3',
        spacing: 'medium'
      }
    },
    {
      type: 'spacer',
      data: {
        height: 'large'
      }
    },
    {
      type: 'text',
      data: {
        content:
          '<div class="text-center"><h2 class="text-2xl font-light mb-4">Honeymoon Fund</h2><p class="max-w-2xl mx-auto">If you\'d prefer to contribute to our honeymoon adventures, we\'ve set up a honeymoon fund that you can find here:</p><a href="#" class="inline-block mt-6 btn-primary px-8 py-3 rounded-full hover:opacity-90 transition-opacity">Contribute to Our Honeymoon</a></div>'
      }
    }
  ]
};
