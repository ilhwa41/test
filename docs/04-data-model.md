# 04. 데이터 모델

> 발주 타이밍 알림 시스템 기획 문서 · 2026-11-07 · 근거: 프로젝트 회의(바이브코딩 팀)

Firestore 컬렉션 구조입니다. 대표 1인 사용 기준이므로 모든 문서에 `ownerId`를 둡니다.

## items (품목)
| 필드 | 설명 |
|---|---|
| name | 품목 이름 (예: 원사) |
| unit | 단위 (개, 롤, kg 등) |
| currentStock | 현재 재고 수량 |
| dailyUsage | 하루 평균 사용량 (직접 입력값, 없으면 최근 기록에서 계산). 소진 예상일(D-숫자)과 추천 발주점 계산에 쓴다 |
| leadTimeDays | 발주 후 입고까지 걸리는 일수 (추천 발주점 계산용) |
| safetyStock | 안전재고 (추천 발주점 계산용) |
| reorderPoint | **발주 알림 기준 수량.** 대표가 직접 입력한 값이 기본 (예: 원사 400). 계산식 추천값은 저장하지 않고 화면에서만 보여준다 |
| urgentPoint | **긴급 알림 기준 수량** (예: 원사 200). 입고 대기 중에도 이 값 이하이면 알림 |
| maxStorage | 최대 보관 가능 수량 |
| supplierId | 발주처 |
| status | normal / warning / reorder / inbound |
| ownerId, createdAt, updatedAt | 공통 |

## stockLogs (재고 기록)
| 필드 | 설명 |
|---|---|
| itemId | 품목 |
| type | in(입고) / out(사용) / adjust(실사 보정) |
| quantity | 수량 |
| memo | 메모 |
| occurredAt | 발생일 |
| ownerId, createdAt | 공통 |

재고 변경은 항상 `stockLogs`에 기록을 남기면서 `items.currentStock`을 함께 갱신한다 (한 번에 처리).

## orders (발주 기록)
| 필드 | 설명 |
|---|---|
| itemId, supplierId | 품목, 발주처 |
| quantity | 발주 수량 |
| orderedAt | 발주일 |
| expectedArrivalAt | 입고 예정일 |
| status | ordered / received / cancelled |
| receivedAt | 실제 입고일 |

## suppliers (발주처)
| 필드 | 설명 |
|---|---|
| name | 발주처 이름 |
| contactMethod | phone / email / sms / kakao |
| contact | 연락처 |
| leadTimeDays | 기본 리드타임 |

## alerts (알림 기록)
| 필드 | 설명 |
|---|---|
| itemId | 품목 |
| level | reorder / urgent |
| channel | email |
| sentAt | 발송 시각 |
| acknowledgedAt | 발주 확인 시각 |

## settings (사용자 설정)
| 필드 | 설명 |
|---|---|
| notifyEmail | 알림 받을 이메일 |
| notifyHour | 알림 시간 |
