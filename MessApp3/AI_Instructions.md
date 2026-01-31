Build a static PWA webapp to be used on Android and iPhone.
I want to build a progressive webapp.

Folder structure:
The app must be located in the MessApp2 directory.
The images for the app can be found in the images folder.
The fonts for the app can be found in the fonts folder.

Style:
The app layout needs to be optimized for portrait operation.
The background of the app is a stretched version of background.png.
The font used for all text is Filmcryptic.ttf .

Global layout:
The app consists of a caroussel page using dot navigation. To go to the next or previous page, the app should allow swipe right and swipe left.
The carousel slide should be fluent. There should also be mouse-drag support.

Functionality:
The source data for app can be retrieved from the following URL: https://github.netvark.net/mess/ActualMenus.json .
This json contains different menu listings for several days.
The app should show the menu listings for today and all future days.
Each carrousel page contains the different menus for a given day. The pages are ordered chronologically. The carousel functionality allows to move to the different days.
If there is no data for a given day, there should be no corresponding page.
If there is no data for today or any future days, an empty screen must be shown.
The app needs to be able to work offline using cached menu data, but needs to update the menu info as well as changes in the webapp (changes to the source files) itself when online. 

Page layout:
At the top of the caroussel page, there is a header. It consists of 2 items: to the left there is a date mention in the following style: name of the day, day number and month number, one above the other, all in Dutch, on the top right hand side, the image header.png is shown. 
Underneath, the menu data for the day is presented in rows. There are 5 rows. Each row consists of an image on the left and text on the right. The rows are: soep, vlees, veggie, grill and groentvdw . The image has the name of the row with extension .png (soep.png, vlees.png, veggie.png, grill.png and groentvdw.png). The text can be found in the json file. It is the menu1 value for the entry with the matching date and the type is the name of the row (soep, vlees, veggie, grill, groentvdw).
The images are aligned on the left hand side, the text is wrapped and centered. 
Underneath the menu data there is a footer: it shows the header but in reversed order: the date is on the right, the header.png image is on the left.

App install:
The PWA has icons to use when the app is installed: in the images folder, there is icon-192.png, icon-192.svg, icon-512.png, icon-512.svg .

