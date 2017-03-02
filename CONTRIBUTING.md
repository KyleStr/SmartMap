Contributing
=====

A guide to help us program together. 

Some ideas borrowed from [thoughtbot].

[thoughtbot]: https://github.com/thoughtbot/guides/tree/master/style

Git
---

* When sensible, we try to use a [git-flow] workflow. When contributing, a [forking workflow] is ideal. PR's should be submitted against `develop`. We love [Sourcetree].
* Write commit messages that another developer will be able to understand in a year's time.

[git-flow]: https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
[forking workflow]: https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow
[Sourcetree]: http://www.sourcetreeapp.com/
[good commit message]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html

JavaScript
----------

### Formatting

* Avoid inline comments.
* Try to avoid long lines, common convention is to break after 80 characters.
* Delete trailing whitespace.
* Don't include spaces inside brackets.
* Use 2 space indentation (no tabs).
* Use an empty line between methods.
* Use spaces around operators, except for unary operators, such as `!`.
* Use spaces after commas, colons, and semicolons.

### Naming

* Filenames should be camelCase.
* Just say no to [Hungarian notation].
* Avoid abbreviations.
* Avoid object types in names (`user_array`, `email_method` `CalculatorClass`, `ReportModule`).
* Name the enumeration parameter the singular of the collection.
* Treat acronyms as words in names (`XmlHttpRequest` not `XMLHTTPRequest`),
  even if the acronym is the entire name (`class Html` not `class HTML`).

[Hungarian notation]: http://en.wikipedia.org/wiki/Hungarian_notation

### Validation

* Use JSHint, see [.jshintrc] for configuration rules.
* We use [EditorConfig] to ensure our editor follows some basic [rules].

[.jshintrc]: /.jshintrc
[EditorConfig]: http://editorconfig.org/
[rules]: /.editorconfig

HTML
----

* Use double quotes for attributes.


Sass
----

### Formatting

* Use the *Scss* syntax.
* Use space between property and value: `width: 20px` not `width:20px`.
* Use a blank line above selector that has styles.
* Prefer hex color codes `#000`. `rgba` is acceptable when transparency is inherent in the color.
* Use `//` for comment blocks not `/* */`.
* Use a space between selector and `{`.
* Use double quotation marks.
* Use only lowercase, including colors.
* Don't add a unit specification after `0` values, unless required by a mixin.
* Use a leading zero in decimal numbers: `0.5` not `.5`
* Use space around operands: `$variable * 1.5`, not `$variable*1.5`
* Use parentheses around individual operations in shorthand declarations: `padding: ($variable * 1.5) ($variable * 2)`

### Order

* Place @extends and @includes at the top of your declaration list.
* Place media queries directly after the declaration list.

### Selectors

* Don't use ID's for style.
* Use meaningful names: `$visual-grid-color` not `$color` or `$vslgrd-clr`.
* Use ID and class names that are as short as possible but as long as necessary.
* Avoid nesting within a media query.

### Organization

* All `.scss` files should be placed in the `\styles` folder.
* Use [compass.rb] for any configuration needs.

[compass.rb]: /config/compass.rb


Backbone
--------

* Name collections the plural version of the model.
* Name views with a `View` suffix.
