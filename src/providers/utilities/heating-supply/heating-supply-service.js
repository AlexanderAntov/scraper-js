﻿import cheerio from 'cheerio';
import { apiConstants, apiProvidersConst, HttpService, NewsModel } from '../../../common/common.js';
import { cloneDeep } from 'lodash';

export class HeatingSupplyService {
    static get(targetKeyword) {
        const options = cloneDeep(apiConstants.heatingSupply);
        return new Promise((resolve, reject) => {
            HttpService.performGetRequest(options, (data) => {
                let $ = cheerio.load(data),
                    breakdownTiles = $('.card.z-depth-3');

                if (breakdownTiles.length === 0) {
                    resolve([]);
                    return;
                }
    
                $('.card.z-depth-3').each((index, elem) => {
                    let articleContainer = $(elem).find('.card-content').eq(0),
                        articleTitle = articleContainer.find('.red-text.text-darken-3');
                    if (targetKeyword && articleTitle.text().toLowerCase().indexOf(targetKeyword.toLowerCase()) > -1) {
                        let articleUrl = articleTitle.attr('href');
    
                        HttpService.performGetRequest({
                            isHttps: false,
                            host: 'toplo.bg',
                            path: `/breakdowns/${articleUrl.match(/\d+$/)[0]}`
                        }, (data) => {
                            let $$ = cheerio.load(data),
                                articleContent = $$('.card-content').eq(1),
                                articleBody = '';
    
                            articleContent.find('p').each((index, elem) => {
                                articleBody += ($$(elem).text().replace(/\r\n\s+/g, '').trim() + '/n');
                            });

                            resolve([new NewsModel({
                                title: articleTitle.text().trim().replace('/n', ''),
                                info: articleBody,
                                url: articleUrl,
                                image: null,
                                dateTime: articleContent.find('.card-title.red-text.text-darken-3')
                                    .text()
                                    .replace(/\r\n\s+/g, '')
                                    .trim(),
                                provider: apiProvidersConst.HEATING.id
                            })]);
                        });
                    } else {
                        resolve([]);
                    }
                });
            });
        });
    }
}
