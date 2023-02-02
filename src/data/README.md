## Data Retrieval

For wage data the Bureau of Labor Statistics series data is used.
You can generate new CSV formatted data from the data retrieval tools: https://data.bls.gov/pdq/SurveyOutputServlet

Data extracted on: February 2, 2023 (8:20:07 AM)

Quarterly Census of Employment and Wages

| Series Id    	| ENU3702140010                                                                                                                  	|
|--------------	|--------------------------------------------------------------------------------------------------------------------------------	|
| Series Title 	| Average Weekly Wage in Total Covered Total, all industries for All establishment sizes in Buncombe County, North Carolina, NSA 	|
| State        	| North Carolina                                                                                                                 	|
| Area         	| Buncombe County, North Carolina                                                                                                	|
| Industry     	| Total, all industries                                                                                                          	|
| Owner        	| Total Covered                                                                                                                  	|
| Size         	| All establishment sizes                                                                                                        	|
| Type         	| Average Weekly Wage                                                                                                            	|

Data can be fetched via the BLS API as such:
https://api.bls.gov/publicAPI/v2/timeseries/data/ENU3702140010/?startyear=2013&endyear=2023&calculations=true&annualaverage=true&aspects=true

This has rate limitations and date range limitations of 10 years therefore downloadable CSV data is much more rich and reliable. This requires manual updating.