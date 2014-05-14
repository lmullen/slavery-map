#!/usr/bin/Rscript

# Load all the census data relating to slavery and population, and create a 
# single table that can be used in a d3.nest.

library(dplyr)
library(stringr)
library(foreign)
options(stringsAsFactors = FALSE)

sqm_sqmi <- function(sq_meters) {
  sq_meters / 2589988.110336;
}

# Read all the CSV files into a list of data frames
fn  <- Sys.glob("data/*.csv")
csv <- lapply(fn, read.csv)
names(csv) <- fn %.% str_replace("data/", "") %.% str_replace(".csv", "")
rm(fn)

calc_derived <- function(df) {
  df %.% mutate(freeTotalPopulation = totalPopulation - slavePopulation,
         slavePercentage = round(100 * slavePopulation / totalPopulation, 2),
         freeAfAmPercentage = round(100 * freeAfAmPopulation / totalPopulation, 2),
         freeTotalPercentage = round(100 * freeTotalPopulation / totalPopulation, 2),
         slaveDensity = round(slavePopulation / sqm_sqmi(area), 2),
         freeAfAmDensity = round(freeAfAmPopulation / sqm_sqmi(area), 2),
         totalDensity = round(totalPopulation / sqm_sqmi(area), 2),
         freeTotalDensity = round(freeTotalPopulation / sqm_sqmi(area), 2)
         ) %.%
  select(-area)
}
# Read all the DBF files into a list of data frames
fn <- Sys.glob("/home/lmullen/research-data/nhgis-shapefiles/epsg4326/*.dbf")
dbf <- lapply(fn, read.dbf, as.is = TRUE)
names(dbf) <-  fn %.% 
  str_replace("/home/lmullen/research-data/nhgis-shapefiles/epsg4326/", "") %.%
  str_replace(".dbf", "")

c_1790 <- csv$nhgis0013_ds1_1790_county %.%
  left_join(csv$nhgis0014_ts_county, by = "GISJOIN") %.%
  left_join(dbf$county_1790, by = "GISJOIN") %.%
  select(GISJOIN,
         totalPopulation = A00AA1790,
         freeAfAmPopulation = AAQ001,
         slavePopulation = AAQ002,
         area = SHAPE_AREA,
         year = YEAR) %.% 
  calc_derived()

c_1800 <- csv$nhgis0013_ds2_1800_county %.%
  left_join(csv$nhgis0014_ts_county, by = "GISJOIN") %.%
  left_join(dbf$county_1800, by = "GISJOIN") %.%
  select(GISJOIN,
         totalPopulation = A00AA1800,
         freeAfAmPopulation = AAY001,
         slavePopulation = AAY002,
         area = SHAPE_AREA,
         year = YEAR) %.% 
  calc_derived()

c_1810 <- csv$nhgis0013_ds3_1810_county %.%
  left_join(csv$nhgis0014_ts_county, by = "GISJOIN") %.%
  left_join(dbf$county_1810, by = "GISJOIN") %.%
  select(GISJOIN,
         totalPopulation = A00AA1810,
         freeAfAmPopulation = AA7001,
         slavePopulation = AA7002,
         area = SHAPE_AREA,
         year = YEAR) %.% 
  calc_derived()

c_1820 <- csv$nhgis0013_ds4_1820_county %.%
  left_join(csv$nhgis0014_ts_county, by = "GISJOIN") %.%
  left_join(dbf$county_1820, by = "GISJOIN") %.%
  mutate(freeAfAmPopulation = ABB005 + ABB006,
         slavePopulation = ABB003 + ABB004) %.%
  select(GISJOIN,
         totalPopulation = A00AA1820,
         freeAfAmPopulation,
         slavePopulation,
         area = SHAPE_AREA,
         year = YEAR) %.% 
  calc_derived()

c_1830 <- csv$nhgis0013_ds5_1830_county %.%
  left_join(csv$nhgis0014_ts_county, by = "GISJOIN") %.%
  left_join(dbf$county_1830, by = "GISJOIN") %.%
  mutate(freeAfAmPopulation = ABO005 + ABO006,
         slavePopulation = ABO003 + ABO004) %.%
  select(GISJOIN,
         totalPopulation = A00AA1830,
         freeAfAmPopulation,
         slavePopulation,
         area = SHAPE_AREA,
         year = YEAR) %.% 
  calc_derived()

c_1840 <- csv$nhgis0013_ds7_1840_county %.%
  left_join(csv$nhgis0014_ts_county, by = "GISJOIN") %.%
  left_join(dbf$county_1840, by = "GISJOIN") %.%
  select(GISJOIN,
         totalPopulation = A00AA1840,
         freeAfAmPopulation = ACS002,
         slavePopulation = ACS003,
         area = SHAPE_AREA,
         year = YEAR) %.% 
  calc_derived()

c_1850 <- csv$nhgis0013_ds10_1850_county %.%
  left_join(csv$nhgis0014_ts_county, by = "GISJOIN") %.%
  left_join(dbf$county_1850, by = "GISJOIN") %.%
  select(GISJOIN,
         totalPopulation = A00AA1850,
         freeAfAmPopulation = AE6002,
         slavePopulation = AE6003,
         area = SHAPE_AREA,
         year = YEAR) %.% 
  calc_derived()

c_1860 <- csv$nhgis0016_ds14_1860_county %.%
  left_join(csv$nhgis0014_ts_county, by = "GISJOIN") %.%
  left_join(dbf$county_1860, by = "GISJOIN") %.%
  mutate(freeAfAmPopulation = AH2003 + AH2004,
         slavePopulation = AH2005 + AH2006) %.%
  select(GISJOIN,
         totalPopulation = A00AA1860,
         freeAfAmPopulation,
         slavePopulation,
         area = SHAPE_AREA,
         year = YEAR) %.% 
  calc_derived()

# Join all the data together
all <- rbind(c_1790, c_1800, c_1810, c_1820, c_1830, c_1840, c_1850, c_1860)

write.csv(all, "census.csv", na = "")
