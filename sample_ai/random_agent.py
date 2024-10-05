
import numpy as np
import random
from puyopuyo import *

class RND_Agent:
    def __init__(self):
        self.action_size = 2

    def __call__(self, board_list, puyo_c):
        board_list = board_list.to_py()
        board = np.zeros(CFG.Height * CFG.Width, dtype=np.int32).reshape(CFG.Height, CFG.Width)
        for i in range(CFG.Height):
            for j in range(CFG.Width):
                if board_list[i][j] != None:
                    board[i][j] = int(board_list[i][j]['puyo']) 
        puyo = Puyopuyo()
        puyo.centerPuyo = puyo_c[0]
        puyo.movablePuyo = puyo_c[1]

        action_list = utils.create_action_list(board)
        if len(action_list) == 0:
            return [2,1]
        random_id = random.randint(0, len(action_list)-1)
        action = action_list[random_id]
        action[1] = action[1] * 90
        return action

agent=RND_Agent()
agent
