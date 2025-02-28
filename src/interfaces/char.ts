export interface Character {
    id: string;
    name: string;
    defaultImgUrl: string;
    thumbImgUrl: string;
    classes: { img: string; className: string }[];
    HaveAwakening: boolean;
    awakeningImg: string;
    color: string;
}
export interface UserCharacter {
    id: string;
    level: number;
    atkTotal: string;
    gameChar: Character;
    isVisibleInRanking:boolean;
}

export interface UserCharCardProps {
    chars: UserCharacter[];
    onAddCharacter: () => void;
    details: boolean;
}
export interface Character {
    id: string;
    name: string;
    defaultImgUrl: string;
    thumbImgUrl: string;
    classes: { img: string; className: string }[];
    HaveAwakening: boolean;
    awakeningImg: string;
    color: string;
}
