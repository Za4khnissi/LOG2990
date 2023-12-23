export const MIN_CHOICES = 2;
export const MAX_CHOICES = 4;

export const MIN_POINTS = 10;
export const MAX_POINTS = 100;
export const POINTS_STEP = 10;
export const TEXT_LENGTH = 20;

export const MIN_CORRECT_CHOICES = 1;
export const MIN_INCORRECT_CHOICES = 1;
export const REMAINING_TIME_QCM=10;
export const MAX_TEXT_CHOICE=20;
export const MIN_TEXT_CHOICE=0;
export const REMAINING_TIME_QRL=20;
export const WAIT_TIME = 1000;
export const WAIT_TIME_3S = 1000;
export const START_TIME = 5000;
export const NEXT_QUESTION_TIME = 3000;

export const IMPOSSIBLE_INDEX = -1;

export const PERCENTAGE = 1.2;
export const DEFAULT_MULTIPLIER = 1;

export const MIN_TIME = 10;
export const MAX_TIME = 60;
export const ID_CONST = 3000;

export const PROGRESS = 100;
export const INTERVAL = 1000;

export const LIMIT_MESSAGES_CHARACTERS = 200;
export const LIMIT_USERNAME_CHARACTERS = 30;

export const MAX_NAME_LENGTH = 30;

export const MIN_ACCESS_CODE = 1000;
export const MAX_ACCESS_CODE = 8999;
export const DATA_TEST = 9999;
export const BONUS = 9999;

export const PAGE_INDEX = 0;
export const PAGE_SIZE = 5;
export const PAGE_SIZE_OPTIONS = [5, 10, 20];
export const ADMIN_PAGE_SIZE_OPTIONS = [5, 10];
export const REAL_MONTH_LAG = 1;
export const PANIC_MODE_ACTIVATION_TIME_QRL = 20;
export const PANIC_MODE_ACTIVATION_TIME_QCM = 10;
export const MIN_VALUE = 0;
export const MID_VALUE = 50;
export const MAX_VALUE = 100;
export const DIAMETER_VALUE = 100;

export const INTERACTION_TIME_FRAME = 5000;

export const STATUS_COLOR = {
    selected: 'yellow',
    submitted: 'green',
    withdrawn: 'black',
    initial: 'red',
};

export const DEFAULT_CHART_OPTIONS = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
            labels: {
                generateLabels: () => [],
            },
        },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: '',
            },
        },
        y: {
            title: {
                display: true,
                text: 'Quantité de joueurs',
            },
            ticks: {
                stepSize: 1,
            },
        },
    },
};
export const BAR_CHART_DATA = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
};
