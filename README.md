# Commodity Price - A Visualization Approach
## MIDS W209 Final Project - Fall 2015
### Younghak Jang | Marguerite Oneto | James Route | Lei Yang

[Presentation](https://docs.google.com/presentation/d/1Nto9Z-JdhVVOKAQTiT_CxpQ_6FrTAQZhTKKN5M65YyQ/edit?usp=sharing) | [Report](https://docs.google.com/document/d/1JR9p4IeuWg2YEvObHlFcBSVQIecLyFbeOflHoB6nuiQ/edit?usp=sharing)

#### Project Concept
Trading commodities — oil, coffee, gold, corn, wheat — is complex. Such products are
exchanged by buying and selling futures contracts. These contracts promise that the seller of
the contract will deliver to the buyer an agreed upon amount of the commodity at a particular
location on a particular date in the future.

At any one time, several futures contracts with different delivery dates are trading for each
commodity. Therefore, there is no single price that can be quoted. Traders must track this
stream of prices. This is both a data manipulation challenge and an information processing
challenge.

#### Goals of Visualization

##### The Audience
They will be experts in the subject area. Two distinct groups of traders buy and sell these
futures contracts: hedgers and speculators. They differ in their reason for futures trading.
Hedgers trade for business. They buy and sell the actual commodities and use the futures
markets to protect themselves from commodity prices that move against them. Speculators
trade for profit. They analyze and forecast futures price movement, trading contracts with the
hope of making a profit.

##### Needs Assessment
The goal of our visualizations is to present commodity pricing information in a more digestible
way for both hedgers and speculators so that they may see trends and the most pertinent,
up-to-date information more easily.

##### Existing Work
There are a few appealing visualization tools that currently exist for commodity futures. One
example is Commodity Screen . Another are the Bloomberg Commodity Index Charts .

##### Form
Our visualizations will take the form of interactive dashboards. Some of the functions we plan
to provide:

1. Ability to show multiple (breakdown) charts in one screen: Individual commodities form
an index. In that case, the trend and volatility of an index is dependent on those of each
commodity, so the users will have need to look at the trend of individual commodities
together with that of the index.

2. Ability to control timeframe: Futures contracts differ in timeframe. In addition, while
there are scalpers who make multiple transactions on a single day, there are also
position traders who may hold their position for weeks. So the user should be able to 
adjust not only the time period (i.e. 1 week, 1 month, 3 month, 1 year) of the entire
x-axis, but how frequent the data is split (i.e. by seconds, minutes, hours, days)

3. Other needs that are hedger and speculator specific (to be determined).

#### Data Sources
We can obtain free commodity data from Quandl , an economic data provider. Quandl provides
packages for both R and Python, through which we can download datasets and manipulate
them within the R or Python environment. From there we can output files in CSV format for
Tableau or D3 to read and display.

Quandl’s datasets are available in daily or yearly resolution, depending on the commodity, and
most datasets have at least 20 years of historical data (one dates back to 1833). Some of
Quandl’s data sources provide thousands of commodity datasets, giving us plenty of
information to use in order to create interesting visualizations. Some example datasets are
listed below:

- OPEC crude price, daily since 2003 (source: OPEC)
- Gold prices, annually since 1833 (source: National Mining Association)
- Corn prices, daily since 2000 (source: Top Flight Grain Co-operative)
- Soybean prices, daily since 2000 (source: Top Flight Grain Co-operative)
- Dairy price indices, monthly since 1999 (source: Global Dairy Trade)

In addition to Quandl, we have two more potential data sources, in case we need to
supplement our data. One is the U.S. Commodity Futures Trading Commission , which provides
aggregated and disaggregated futures data for the past 15-20 years. Another potential source is
turtletrader.com , a well-respected financial industry source for commodity prices. Turtletrader
appears to charge a fee for its data, so this source may not be viable for our project.

#### References
- Daniels Trading
- Additional backup data sources:
 - http://www.data.gov/open-gov/
 - http://datahub.io/dataset
 - http://dataportals.org
 - https://aws.amazon.com/datasets/




