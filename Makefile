default: us.json coast.json census.csv

shapefiles := ~/research-data/nhgis-shapefiles/epsg4326

us.json:
		node --max_old_space_size=7192 \
		/usr/local/bin/topojson \
	  -o $@ \
		-q 1e5 -s 0.5 \
		--projection 'd3.geo.albers().scale(1000).translate([423, 240])' \
		--id-property GISJOIN \
		-p c=NHGISNAM \
		-p s=STATENAM \
		-- \
		$(shapefiles)/county_1790.shp \
		$(shapefiles)/county_1800.shp \
    $(shapefiles)/county_1810.shp \
		$(shapefiles)/county_1820.shp \
		$(shapefiles)/county_1830.shp \
		$(shapefiles)/county_1840.shp \
		$(shapefiles)/county_1850.shp \
		$(shapefiles)/county_1860.shp

census.csv: aggregate-data.r
	Rscript --vanilla aggregate-data.r

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
	rm -f us.json coast.json census.csv

deploy:
	rsync --progress --delete -avz \
		*.json *.html *.css *.js *.csv \
		reclaim:~/public_html/lincolnmullen.com/projects/slavery/

.PHONY : default clean clobber deploy

