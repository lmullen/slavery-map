generated = coast.json rivers.json \
	us_1790.json us_1800.json us_1810.json us_1820.json \
	us_1830.json us_1840.json us_1850.json us_1860.json

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
		-p pop_free_white=+AAQ003 \
		-p pop_free_black=+AAQ001 \
		-p pop_slave=+AAQ002 \
		-e data/nhgis0014_ts_county.csv \
		-p pop_total=+A00AA1790 \
		-- $< 

us_1800.json: $(shapefiles)/county_1800.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds2_1800_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p pop_free_black=+AAY001 \
		-p pop_slave=+AAY002 \
		-e data/nhgis0014_ts_county.csv \
		-p pop_total=+A00AA1800 \
		-- $< 

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
		-p pop_free_black=+AA7001 \
		-p pop_slave=+AA7002 \
		-e data/nhgis0014_ts_county.csv \
		-p pop_total=+A00AA1810 \
		-- $< 

# All these are for men and not women, though women are in other fields
us_1820.json: $(shapefiles)/county_1820.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds4_1820_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p pop_free_black=+ABB005 \
		-p pop_slave=+ABB003 \
		-p pop_free_white=+ABB001 \
		-e data/nhgis0014_ts_county.csv \
		-p pop_total=+A00AA1820 \
		-- $< 

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
		-p pop_free_black=+ABQ002 \
		-p pop_slave=+ABQ001 \
		-e data/nhgis0014_ts_county.csv \
		-p pop_total=+A00AA1830 \
		-- $< 

us_1840.json: $(shapefiles)/county_1840.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds7_1840_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p pop_free_white=+ACS001 \
		-p pop_free_black=+ACS002 \
		-p pop_slave=+ACS003 \
		-e data/nhgis0014_ts_county.csv \
		-p pop_total=+A00AA1840 \
		-- $< 

us_1850.json: $(shapefiles)/county_1850.shp
	topojson -o $@ \
		-q 1e4 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-e data/nhgis0013_ds10_1850_county.csv \
		--id-property GISJOIN \
		-p county=NHGISNAM \
		-p state=STATENAM \
		-p area=+SHAPE_AREA \
		-p pop_free_white=+AE6001 \
		-p pop_free_black=+AE6002 \
		-p pop_slave=+AE6003 \
		-e data/nhgis0014_ts_county.csv \
		-p pop_total=+A00AA1850 \
		-- $< 

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
		-p pop_slave=+AHB001 \
		-p slaveholders=+AHA001 \
		-e data/nhgis0014_ts_county.csv \
		-p pop_total=+A00AA1860 \
		-- $< 

build/ne_50m_coastline.zip:
	mkdir -p $(dir $@)
	curl -o $@ http://www.nacis.org/naturalearth/50m/physical/$(notdir $@)

build/ne_50m_coastline.shp: build/ne_50m_coastline.zip
	unzip -od $(dir $@) $<
	touch $@

coast.json: build/ne_50m_coastline.shp
	ogr2ogr -f "ESRI Shapefile" -clipsrc -129, 22, -65, 54 \
		$(dir $<)coast-clipped/ $< 
	topojson -o $@ -s 1.0 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		coast=$(dir $<)coast-clipped/$(notdir $<)

build/ne_10m_rivers_lake_centerlines_scale_rank.zip:
	mkdir -p $(dir $@)
	curl -o $@ http://www.nacis.org/naturalearth/10m/physical/$(notdir $@)

build/ne_10m_rivers_lake_centerlines_scale_rank.shp: build/ne_10m_rivers_lake_centerlines_scale_rank.zip
	unzip -od $(dir $@) $<
	touch $@

rivers.json: build/ne_10m_rivers_lake_centerlines_scale_rank.shp
	ogr2ogr -f "ESRI Shapefile" -clipsrc -129, 22, -65, 5 \
		$(dir $<)rivers-clipped/ $< 
	topojson -o $@ \
		-p name -p weight=strokeweig \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		rivers=$(dir $<)rivers-clipped/$(notdir $<)

clean: 
	rm -rf build/*

clobber:
	rm $(generated)

.PHONY : default clean clobber

