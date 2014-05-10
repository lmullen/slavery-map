generated = coast.json us_1790.json us_1800.json us_1810.json \
						us_1820.json us_1830.json us_1840.json us_1850.json us_1860.json

default: $(generated)

shapefiles := ~/research-data/nhgis-shapefiles/epsg4326

us_1790.json: $(shapefiles)/county_1790.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds1_1790_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p whitePopulation=+AAQ003 \
		-p freeBlackPopulation=+AAQ001 \
		-p slavePopulation=+AAQ002 \
		-p slavesPerSlaveholder=+AAJ001 \
		-p slaveholders='+AAE001 + +AAE002' \
		-p slaveholdersPercentage='100 * (+AAE001 + +AAE002) / (+AAE003 + +AAE003 + +AAE003 + +AAE004)' \
		-e data/nhgis0014_ts_county.csv \
		-p totalPopulation=+A00AA1790 \
		-- county=$< 

us_1800.json: $(shapefiles)/county_1800.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds2_1800_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p freeBlackPopulation=+AAY001 \
		-p slavePopulation=+AAY002 \
		-e data/nhgis0014_ts_county.csv \
		-p totalPopulation=+A00AA1800 \
		-- county=$< 

# Free white population not present
us_1810.json: $(shapefiles)/county_1810.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds3_1810_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p freeBlackPopulation=+AA7001 \
		-p slavePopulation=+AA7002 \
		-e data/nhgis0014_ts_county.csv \
		-p totalPopulation=+A00AA1810 \
		-- county=$< 

us_1820.json: $(shapefiles)/county_1820.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds4_1820_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p freeBlackPopulation='+ABB005 + +ABB006' \
		-p slavePopulation='+ABB003 + +ABB004' \
		-p whitePopulation='+ABB001 + +ABB002' \
		-e data/nhgis0014_ts_county.csv \
		-p totalPopulation=+A00AA1820 \
		-- county=$< 

# Missing free white population
us_1830.json: $(shapefiles)/county_1830.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds5_1830_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p freeBlackPopulation=+ABQ002 \
		-p slavePopulation=+ABQ001 \
		-e data/nhgis0014_ts_county.csv \
		-p totalPopulation=+A00AA1830 \
		-- county=$< 

us_1840.json: $(shapefiles)/county_1840.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds7_1840_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p whitePopulation=+ACS001 \
		-p freeBlackPopulation=+ACS002 \
		-p slavePopulation=+ACS003 \
		-e data/nhgis0014_ts_county.csv \
		-p totalPopulation=+A00AA1840 \
		-- county=$< 

us_1850.json: $(shapefiles)/county_1850.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds10_1850_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p whitePopulation=+AE6001 \
		-p freeBlackPopulation=+AE6002 \
		-p slavePopulation=+AE6003 \
		-e data/nhgis0014_ts_county.csv \
		-p totalPopulation=+A00AA1850 \
		-- county=$< 

us_1860.json: $(shapefiles)/county_1860.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds14_1860_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p pop_free=+AHB002 \
		-p slavePopulation=+AHB001 \
		-p slaveholders=+AHA001 \
		-e data/nhgis0014_ts_county.csv \
		-p totalPopulation=+A00AA1860 \
		-- county=$< 

build/ne_50m_coastline.zip:
	mkdir -p $(dir $@)
	curl -o $@ http://www.nacis.org/naturalearth/50m/physical/$(notdir $@)

build/ne_50m_coastline.shp: build/ne_50m_coastline.zip
	unzip -od $(dir $@) $<
	touch $@

coast.json: build/ne_50m_coastline.shp
	ogr2ogr -f "ESRI Shapefile" -overwrite -clipsrc -129, 22, -65, 54 \
		$(dir $<)coast-clipped/ $< 
	topojson -o $@ -s 1.0 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		coast=$(dir $<)coast-clipped/$(notdir $<)

clean: 
	rm -rf build/*

clobber:
	rm $(generated)

deploy:
	rsync --progress --delete -avz \
		*.json *.html *.css *.js \
		reclaim:~/public_html/lincolnmullen.com/projects/slavery/

.PHONY : default clean clobber deploy

