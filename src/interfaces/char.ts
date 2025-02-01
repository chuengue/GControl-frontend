export interface UserCharacter {
    level: number;
    atkTotal: string;
    gameChar: {
        id: string;
        name: string;
        classes: { img: string; className: string }[];
        HaveAwakening: boolean;
        awakeningImg: string;
        color: string;
    };
}

export interface UserCharCardProps {
    chars: UserCharacter[];
    onAddCharacter: () => void;
    details: boolean;
}
