# Scraper API

is a modular web scraper which performs analysis on the data being collected. The API itself is deployed in [heroku](https://scraper-api.herokuapp.com/). The API is being used by the [Scraper Android](https://github.com/AlexanderAntov/scraper-android) and [Scraper web](https://github.com/AlexanderAntov/scraper-web) applications that do not perform extra modifications on the data. They are just UI wrappers that use the API.

The current data is being collected from the CNN, BBC, Google News, Tech Crunch and The Verge rss feeds, the New York Times and the Open Weather APIs and two public utility services. [tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) over [n-grams](https://en.wikipedia.org/wiki/N-gram) with small weight modifications is used on the data collected as well as the [RAKE](https://www.researchgate.net/publication/227988510_Automatic_Keyword_Extraction_from_Individual_Documents) algorithm for bigger blocks of text with the same context.

The API is intended for personal use only and will never be used for commercial usage.