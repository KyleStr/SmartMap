Updates to *Analytics* since 27 June release:
---

1. Major update to the Filter/Histogram tool.
	* Quick explanation of how to use the tool.
	* Fixed formatting for x-axis labels.
	* Input boxes allow you full control over the range you want to select.
	* Displays count of regions in current selection.
	* Toggle button added to switch between raw and normalized distribution.
	* Added validation to min and max values.
	
* Analytics now notifies you of how many regions have been selected by all your filters.

* Analytics can now normalize data for filtering. When viewing the histogram, simple click '#' or '%' to toggle between the raw or normalized view. [^data-specific]

* Added actual data values to the map popups. Now when you click a region on the map, you can see the values for the indicators you have selected.

* The 'Results' table now only displays when it is needed, and does not open unless the user chooses to do so. The table now also displays data values just as you filtered them (whether raw or normalized).

* Layers and Webmaps have been moved to a widget similar to the basemap selector.
	* The entire left panel has been dedicated to Analytics.
	* Layers and Webmaps have been styled to match the rest of the application.

* Added help content for each step in Analytics as well as Layers and Webmaps.

* Each indicator now has an 'Info' button which shows a detailed description of that indicator. [^db]


* Styled the app so that it can be quickly and easily integrated with NEXSO platform.

* 'Start Over' option now resets all selected indicators and clears the map and results.

* Changed 'Step 2' label per MIF request.

* Fixed layer ordering issue where Projects displayed under the rest of the layers. Also changed the graphic used for project locations.

* You can now click anywhere in the title area of the Results table to expand/collapse it.

* Modified icons used in Analytics to be more intuitive.

* Other general UI cleanup.

[^data-specific]: Only valid for data that supports this action
[^db]: Content is pending database update