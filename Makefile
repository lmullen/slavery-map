default: us.json coast.json

shapefiles := ~/research-data/nhgis-shapefiles/epsg4326

us.json:
		node --max_old_space_size=7192 \
		/usr/local/bin/topojson \
	  -o $@ \
		-q 1e5 -s 0.2 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		-p c=NHGISNAM \
		-p s=STATENAM \
		-p a=+SHAPE_AREA \
		-- \
		$(shapefiles)/county_1790.shp \
		$(shapefiles)/county_1800.shp \
    $(shapefiles)/county_1810.shp \
		$(shapefiles)/county_1820.shp \
		$(shapefiles)/county_1830.shp \
		$(shapefiles)/county_1840.shp \
		$(shapefiles)/county_1850.shp \
		$(shapefiles)/county_1860.shp

# us_1790.json: $(shapefiles)/county_1790.shp
# 	topojson -o $@ \
# 		-e data/nhgis0013_ds1_1790_county.csv \
# 		--id-property GISJOIN \
# 		-p county=NHGISNAM \
# 		-p state=STATENAM \
# 		-p area=+SHAPE_AREA \
# 		-p freeAfAmPopulation=+AAQ001 \
# 		-p slavePopulation=+AAQ002 \
# 		-e data/nhgis0014_ts_county.csv \
# 		-p totalPopulation=+A00AA1790 \
# 		-- $< 

# us_1800.json: $(shapefiles)/county_1800.shp
# 	topojson -o $@ \
# 		-e data/nhgis0013_ds2_1800_county.csv \
# 		--id-property GISJOIN \
# 		-p county=NHGISNAM \
# 		-p state=STATENAM \
# 		-p area=+SHAPE_AREA \
# 		-p freeAfAmPopulation=+AAY001 \
# 		-p slavePopulation=+AAY002 \
# 		-e data/nhgis0014_ts_county.csv \
# 		-p totalPopulation=+A00AA1800 \
# 		-- $< 

# us_1810.json: $(shapefiles)/county_1810.shp
# 	topojson -o $@ \
# 		-e data/nhgis0013_ds3_1810_county.csv \
# 		--id-property GISJOIN \
# 		-p county=NHGISNAM \
# 		-p state=STATENAM \
# 		-p area=+SHAPE_AREA \
# 		-p freeAfAmPopulation=+AA7001 \
# 		-p slavePopulation=+AA7002 \
# 		-e data/nhgis0014_ts_county.csv \
# 		-p totalPopulation=+A00AA1810 \
# 		-- $< 

# us_1820.json: $(shapefiles)/county_1820.shp
# 	topojson -o $@ \
# 		-e data/nhgis0013_ds4_1820_county.csv \
# 		--id-property GISJOIN \
# 		-p county=NHGISNAM \
# 		-p state=STATENAM \
# 		-p area=+SHAPE_AREA \
# 		-p freeAfAmPopulation='+ABB005 + +ABB006' \
# 		-p slavePopulation='+ABB003 + +ABB004' \
# 		-e data/nhgis0014_ts_county.csv \
# 		-p totalPopulation=+A00AA1820 \
# 		-- $< 

# us_1830.json: $(shapefiles)/county_1830.shp
# 	topojson -o $@ \
# 		-e data/nhgis0013_ds5_1830_county.csv \
# 		--id-property GISJOIN \
# 		-p county=NHGISNAM \
# 		-p state=STATENAM \
# 		-p area=+SHAPE_AREA \
# 		-p freeAfAmPopulation='+ABO005 + +ABO006' \
# 		-p slavePopulation='+ABO003 + +ABO004' \
# 		-e data/nhgis0014_ts_county.csv \
# 		-p totalPopulation=+A00AA1830 \
# 		-- $< 

# us_1840.json: $(shapefiles)/county_1840.shp
# 	topojson -o $@ \
# 		-e data/nhgis0013_ds7_1840_county.csv \
# 		--id-property GISJOIN \
# 		-p county=NHGISNAM \
# 		-p state=STATENAM \
# 		-p area=+SHAPE_AREA \
# 		-p freeAfAmPopulation=+ACS002 \
# 		-p slavePopulation=+ACS003 \
# 		-e data/nhgis0014_ts_county.csv \
# 		-p totalPopulation=+A00AA1840 \
# 		-- $< 

# us_1850.json: $(shapefiles)/county_1850.shp
# 	topojson -o $@ \
# 		-e data/nhgis0013_ds10_1850_county.csv \
# 		--id-property GISJOIN \
# 		-p county=NHGISNAM \
# 		-p state=STATENAM \
# 		-p area=+SHAPE_AREA \
# 		-p freeAfAmPopulation=+AE6002 \
# 		-p slavePopulation=+AE6003 \
# 		-e data/nhgis0014_ts_county.csv \
# 		-p totalPopulation=+A00AA1850 \
# 		-- $< 

# us_1860.json: $(shapefiles)/county_1860.shp
# 	topojson -o $@ \
# 		-e data/nhgis0016_ds14_1860_county.csv \
# 		--id-property GISJOIN \
# 		-p county=NHGISNAM \
# 		-p state=STATENAM \
# 		-p area=+SHAPE_AREA \
# 		-p freeAfAmPopulation='+AH2003 + +AH2004' \
# 		-p slavePopulation='+AH2005 + +AH2006' \
# 		-e data/nhgis0014_ts_county.csv \
# 		-p totalPopulation=+A00AA1860 \
# 		-- $< 

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
	rm -f us.json coast.json

deploy:
	rsync --progress --delete -avz \
		*.json *.html *.css *.js \
		reclaim:~/public_html/lincolnmullen.com/projects/slavery/

.PHONY : default clean clobber deploy

