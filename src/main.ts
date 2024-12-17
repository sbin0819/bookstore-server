import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 (Preflight 요청 포함)
  app.enableCors({
    origin: ['http://localhost:3000', 'https://bookstore-mu-blond.vercel.app'],
    credentials: true, // 쿠키 전송을 허용
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // 허용할 HTTP 메소드
    allowedHeaders: 'Content-Type, Accept, Authorization', // 허용할 헤더
    preflightContinue: false, // Preflight 요청을 처리 후 종료
    optionsSuccessStatus: 204, // Preflight 요청 성공 시 상태 코드
  });

  app.use(cookieParser());

  // Swagger 설정 시작
  const config = new DocumentBuilder()
    .setTitle('도서 검색 API') // API 제목
    .setDescription('Naver 도서 검색 API 문서입니다.') // API 설명
    .setVersion('1.0') // API 버전
    .addTag('search') // 태그 (컨트롤러에 설정한 태그와 일치)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Swagger UI는 /api 경로에서 접근 가능

  await app.listen(4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger is running on: ${await app.getUrl()}/api`);
}
bootstrap();