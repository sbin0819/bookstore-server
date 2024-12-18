// src/search/search.service.ts
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BookItemDto } from './dto/book-item.dto'; // 개별 도서 항목
import { BookListResponseDto } from './dto/book-list-response.dto';

@Injectable()
export class SearchService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('NAVER_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');
  }

  // 기존 일반 검색 메서드
  search(
    query: string,
    display = 10,
    start = 1,
    sort = 'sim',
  ): Observable<BookListResponseDto> {
    const url = 'https://openapi.naver.com/v1/search/book.json';
    const headers = {
      'X-Naver-Client-Id': this.clientId,
      'X-Naver-Client-Secret': this.clientSecret,
    };

    const params = {
      query,
      display: Number(display),
      start: Number(start),
      sort,
    };

    return this.httpService.get(url, { headers, params }).pipe(
      map((response: AxiosResponse<BookListResponseDto>) => response.data),
      catchError((error) => {
        this.logger.error(
          'Naver API Error',
          error.response?.data || error.message,
        );
        throw new HttpException(
          error.response?.data ||
            'Naver API로부터 데이터를 가져오는 데 실패했습니다.',
          error.response?.status || 500,
        );
      }),
    );
  }

  // ISBN 검색 메서드 추가
  searchByIsbn(isbn: string): Observable<BookItemDto> {
    return this.search(isbn, 1, 1, 'sim').pipe(
      map((data) => {
        if (!data.items || data.items.length === 0) {
          throw new HttpException(`ISBN ${isbn}에 대한 결과가 없습니다.`, 404);
        }
        return data.items[0]; // 첫 번째 검색 결과 반환
      }),
    );
  }
}
