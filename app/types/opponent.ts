import type { StatsTable } from "@smogon/calc";

export interface OpponentMove {
  name: string;
  koName: string;
  /** 이 기술을 쓸 때의 성격 (기술의 공격 능력치를 깎지 않는 통계 상위 성격) */
  nature?: string;
  /** 이 기술을 쓸 때의 능력 포인트. 없으면 OpponentSet.sp */
  sp?: Partial<StatsTable>;
}

/** 사용률 상위 포켓몬의 대표 세팅 (각 항목 1위) */
export interface OpponentSet {
  /** 사용률 순위. 사용자 지정 상대는 없다. */
  position?: number;
  /** 계산기 입력용 Showdown 이름. 메가스톤을 들면 메가 폼 ("Garchomp-Mega-Z") */
  name: string;
  koName: string;
  sprite?: string;
  ability?: string;
  item?: string;
  /** 능력 포인트 */
  sp: Partial<StatsTable>;
  /** 변화기를 뺀 공격 기술 상위 4개 */
  moves: OpponentMove[];
}
