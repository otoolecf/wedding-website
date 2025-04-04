export const faqTemplate = {
  name: 'FAQ',
  sections: [
    {
      type: 'hero',
      data: {
        heading: 'FAQ',
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
          '<div class="w-16 h-px bg-secondary mx-auto mb-8"></div><div class="space-y-4"><ul class="flex flex-col text-left gap-6"><li><p><strong class="text-primary">Where To Stay?</strong> Stay wherever you want!</p></li><li><p><strong class="text-primary">Kids?</strong> Nope.</p></li></ul></div>'
      }
    }
  ]
};
