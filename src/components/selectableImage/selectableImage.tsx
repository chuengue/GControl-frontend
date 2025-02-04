import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Backdrop } from '@mui/material';
import React from 'react';
import { Character } from '../../interfaces/char';

interface SelectableImageProps {
    char: Character;
    isSelected: boolean;
    onSelect: (char: Character) => void;
    disabled: boolean;
}

const SelectableImage: React.FC<SelectableImageProps> = ({
    char,
    isSelected,
    onSelect,
    disabled = false
}) => {
    return (
        <div
            style={{
                position: 'relative',
                display: 'inline-block',
                margin: '3px',
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            onClick={() => !disabled && onSelect(char)} // Impede clique se desativado
        >
            <img
                src={char.thumbImgUrl}
                alt={char.name}
                width="70px"
                height="70px"
                style={{
                    borderRadius: '5px',
                    opacity: disabled ? 0.5 : 1 // Reduz opacidade se desativado
                }}
            />

            {isSelected && (
                <>
                    <Backdrop
                        open={true}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '70px',
                            height: '70px',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '5px',
                            zIndex: 1
                        }}
                    />
                    <CheckCircleIcon
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: '30px',
                            zIndex: 2
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default SelectableImage;
