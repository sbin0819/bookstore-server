// src/search/search.service.ts
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
@Injectable()
export class SearchService {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('NAVER_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');
  }

  search(
    query: string,
    display = 10,
    start = 1,
    sort = 'sim',
  ): Observable<any> {
    const url = 'https://openapi.naver.com/v1/search/book.json';
    const headers = {
      'X-Naver-Client-Id': this.clientId,
      'X-Naver-Client-Secret': this.clientSecret,
    };

    const params = {
      query,
      display,
      start,
      sort,
    };

    return this.httpService.get(url, { headers, params }).pipe(
      map((response: AxiosResponse) => response.data),
      catchError((error) => {
        throw new HttpException(
          error.response?.data || 'Failed to fetch from Naver API',
          error.response?.status || 500,
        );
      }),
    );
  }
}
