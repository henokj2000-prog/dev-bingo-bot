
COLUMN_RANGES = {
    'B': (1, 15),
    'I': (16, 30),
    'N': (31, 45),
    'G': (46, 60),
    'O': (61, 75)
import random

# Column ranges for 75-ball bingo
COLUMN_RANGES = {
    'B': (1, 15),
    'I': (16, 30),
    'N': (31, 45),
    'G': (46, 60),
    'O': (61, 75)
}

def generate_card():
    """Generate a 5x5 bingo card with unique numbers per column, middle cell FREE."""
    cols = []
    for col in COLUMN_RANGES:
        low, high = COLUMN_RANGES[col]
        cols.append(random.sample(range(low, high+1), 5))
    # Transpose to rows
    rows = [list(row) for row in zip(*cols)]
    # Free space in the middle
    rows[2][2] = 'FREE'
    return rows

def draw_ball(drawn_balls):
    """Return a new ball (e.g., 'B12') not already drawn, or None if all 75 drawn."""
    all_balls = []
    for col, (low, high) in COLUMN_RANGES.items():
        for num in range(low, high+1):
            all_balls.append(f"{col}{num}")
    remaining = [b for b in all_balls if b not in drawn_balls]
    return random.choice(remaining) if remaining else None

def check_bingo(card, drawn_set):
    """Return True if the card has a complete line (row, column, or diagonal)."""
    # Convert drawn ball strings (e.g., 'B12') to numbers
    drawn_numbers = set()
    for ball in drawn_set:
        try:
            num = int(ball[1:])
            drawn_numbers.add(num)
        except:
            pass  # ignore malformed
    
    # Mark card cells
    marked = []
    for row in card:
        marked_row = []
        for cell in row:
            if cell == 'FREE':
                marked_row.append(True)
            elif isinstance(cell, int) and cell in drawn_numbers:
                marked_row.append(True)
            else:
                marked_row.append(False)
        marked.append(marked_row)
    
    # Check rows
    for row in marked:
        if all(row):
            return True
    # Check columns
    for col in range(5):
        if all(marked[row][col] for row in range(5)):
            return True
    # Check main diagonal
    if all(marked[i][i] for i in range(5)):
        return True
    # Check anti-diagonal
    if all(marked[i][4-i] for i in range(5)):
        return True
    return False
