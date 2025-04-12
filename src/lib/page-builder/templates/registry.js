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
              '<div class="bg-white p-6 rounded-lg text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"><img src="https://picsum.photos/seed/target/400/200" alt="Target" class="w-full h-48 object-cover rounded mb-4"/><h2 class="text-xl font-medium mb-2 text-primary">Target</h2><p class="text-secondary text-sm">Home essentials and decor</p></div>'
          },
          {
            content:
              '<div class="bg-white p-6 rounded-lg text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"><img src="https://picsum.photos/seed/amazon/400/200" alt="Amazon" class="w-full h-48 object-cover rounded mb-4"/><h2 class="text-xl font-medium mb-2 text-primary">Amazon</h2><p class="text-secondary text-sm">Everything under the sun</p></div>'
          },
          {
            content:
              '<div class="bg-white p-6 rounded-lg text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"><img src="https://picsum.photos/seed/crate/400/200" alt="Crate & Barrel" class="w-full h-48 object-cover rounded mb-4"/><h2 class="text-xl font-medium mb-2 text-primary">Crate & Barrel</h2><p class="text-secondary text-sm">Kitchen and entertaining must-haves</p></div>'
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
