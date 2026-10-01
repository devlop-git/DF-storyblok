import { storyblokEditable } from "@storyblok/react/rsc";

// Adapts a component ported from the Strapi frontend (which takes `data`) to a
// Storyblok block (which receives `blok`), and makes it clickable in the
// Visual Editor. Extra props (e.g. `commerce` on PLP pages) are passed through.
export function withEditable(Component) {
  function EditableBlok({ blok, ...rest }) {
    return (
      <div {...storyblokEditable(blok)}>
        <Component data={blok} {...rest} />
      </div>
    );
  }

  EditableBlok.displayName = `Editable(${Component.displayName || Component.name})`;
  return EditableBlok;
}
